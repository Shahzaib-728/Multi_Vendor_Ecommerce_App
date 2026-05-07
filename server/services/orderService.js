import Order from '../models/Order.js';
import Product from '../models/Product.js';
import RefundRequest from '../models/RefundRequest.js';
import User from '../models/User.js';
import { performRefund } from './refundService.js';

export async function listCustomerOrders(customerId) {
  return await Order.find({ customer: customerId })
    .populate('items.product')
    .lean();
}

export async function getOrderById(orderId) {
  return await Order.findById(orderId)
    .populate('items.product')
    .populate('deliveryPartner', 'name email')
    .lean();
}

export async function createOrder(customerId, items, deliveryPartnerId, shippingAddress, paymentId) {
  // 1. Group items by Seller
  const sellerGroups = {};

  for (const item of items) {
    const product = await Product.findById(item.productId || item.id);
    if (!product) continue;

    const sellerId = product.seller.toString();
    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = [];
    }

    sellerGroups[sellerId].push({
      product: product,
      qty: item.qty || 1
    });
  }

  const createdOrders = [];

  // 2. Create an Order for each Seller Group
  for (const [sellerId, groupItems] of Object.entries(sellerGroups)) {
    let totalAmount = 0;
    const orderItems = [];

    for (const groupItem of groupItems) {
      const { product, qty } = groupItem;

      // START: Stock Check & Decrement
      if (product.stock < qty) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      product.stock -= qty;
      await product.save();
      // END: Stock Check & Decrement

      // Use Discount Price if available
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      totalAmount += price * qty;

      orderItems.push({
        product: product._id,
        quantity: qty,
        price: price, // Save effective price
        seller: product.seller
      });
    }

    // Shipping Fee Logic: If we want shipping fee per order, apply here.
    // If delivery partner is selected, they usually charge per trip.
    // Since we split orders, technically it's multiple trips or one complex trip.
    // Simplifying: Add shipping fee to EACH order if a partner is selected for that order.
    // Since the frontend selects ONE partner for the whole checkout, we assign that partner to ALL split orders.
    const shippingFee = deliveryPartnerId ? 150 : 0;
    totalAmount += shippingFee;

    // Platform Fee Logic: 10% of Order Value (excluding shipping)
    const orderValue = totalAmount - shippingFee;
    const platformFee = orderValue * 0.10;
    const netAmount = orderValue - platformFee;

    const order = new Order({
      customer: customerId,
      items: orderItems,
      totalAmount,
      shippingFee,
      platformFee,
      netAmount,
      payoutStatus: 'Pending',
      orderStatus: 'Placed', // Auto-Accept
      paymentStatus: 'Paid', // All orders are pre-paid via card
      deliveryPartner: deliveryPartnerId || null,
      shippingAddress,
      seller: sellerId,
      paymentId,
      paymentMethod: 'Stripe',
      // Initialize Timeline
      trackingTimeline: [{
        status: 'Placed',
        location: 'Online',
        note: 'Order placed successfully'
      }]
    });

    const savedOrder = await order.save();
    createdOrders.push(savedOrder);
  }

  // Return one of them or array? 
  // Controller expects res.json(order), let's see controller.
  // It says res.json(order). If we return array, frontend might break if it expects object.
  // But Checkout.jsx doesn't use the return value much, just checks for success.
  // Let's return the first one or a wrapper.
  return createdOrders;
}

import { createEarningTransaction } from './walletService.js';

export async function handleOrderDelivery(order) {
  if (order.payoutStatus === 'ReadyForPayout' || order.payoutStatus === 'Paid') {
    return; // Already processed
  }

  // 1. Create Transaction for Seller (order earnings minus platform fee)
  await createEarningTransaction(
    order.seller,
    order._id,
    order.netAmount,
    'OrderEarning',
    `Order #${order._id.toString().slice(-6).toUpperCase()} - Product Sale`
  );

  // 2. Create Transaction for Delivery Partner (shipping fee)
  if (order.deliveryPartner && order.shippingFee > 0) {
    await createEarningTransaction(
      order.deliveryPartner,
      order._id,
      order.shippingFee,
      'DeliveryFee',
      `Order #${order._id.toString().slice(-6).toUpperCase()} - Delivery Fee`
    );
  }

  // 3. Update Order Payout Status
  order.payoutStatus = 'ReadyForPayout';
  await order.save();
}

export async function updateOrderStatus(id, status) {
  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found');

  order.orderStatus = status;
  await order.save();

  // Sync with RefundRequest if applicable
  const refundRequest = await RefundRequest.findOne({ order: id });
  if (refundRequest) {
    if (status === 'Picking Up (Return)') {
      refundRequest.status = 'In_Return_Transit';
      await refundRequest.save();
    }
  }

  if (status === 'Delivered') {
    await handleOrderDelivery(order);
  }

  if (status === 'Returned') {
    await performRefund(order._id);
  }

  return order;
}

export async function cancelOrder(orderId, customerId) {
  const order = await Order.findOne({ _id: orderId, customer: customerId });
  if (!order) throw new Error('Order not found');
  if (order.orderStatus !== 'Pending Approval') throw new Error('Order cannot be cancelled after approval');

  order.orderStatus = 'Cancelled';
  return await order.save();
}

export async function listSellerOrders(sellerId) {
  // New simplified query with root seller field
  const orders = await Order.find({ seller: sellerId })
    .populate('items.product')
    .populate('customer', 'name email')
    .lean();

  return {
    pending: orders.filter(o => ['Placed', 'Pending Approval', 'Processing', 'Packed', 'Ready for Pickup'].includes(o.orderStatus)),
    approved: orders.filter(o => o.orderStatus === 'Shipped'),
    delivered: orders.filter(o => o.orderStatus === 'Delivered')
  };
}
