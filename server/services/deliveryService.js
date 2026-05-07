import Order from '../models/Order.js';
import User from '../models/User.js';
import { updateOrderStatus } from './orderService.js';

// Get orders assigned to a specific delivery partner
export async function listAssignedOrders(deliveryPartnerId) {
  const orders = await Order.find({
    deliveryPartner: deliveryPartnerId,
    orderStatus: { $in: ['Packed', 'Ready for Pickup', 'Picked Up', 'In Transit Hub', 'In Transit', 'Destination Hub', 'Out for Delivery', 'Delivered', 'Return Pending', 'Picking Up (Return)', 'Returned'] }
  })
    .populate('customer', 'name email phoneNumber')
    .populate('items.product', 'name image')
    .sort({ createdAt: -1 })
    .lean();

  return orders;
}

// Get delivery partner profile
export async function getDeliveryPartnerProfile(partnerId) {
  const partner = await User.findById(partnerId).select('-password');
  if (!partner || partner.role !== 'Delivery') {
    throw new Error('Delivery partner not found');
  }
  return partner;
}

// Update order status
export async function updateDeliveryStatusService(orderId, status) {
  return await updateOrderStatus(orderId, status);
}

// Calculate revenue stats
export async function getDeliveryRevenue(partnerId) {
  const completedOrders = await Order.find({
    deliveryPartner: partnerId,
    orderStatus: 'Delivered'
  });

  const deliveredCount = completedOrders.length;
  const totalDeliveredValue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Assumption: Delivery partner gets 5% of order value as commission
  const totalEarnings = totalDeliveredValue * 0.05;

  return {
    deliveredCount,
    totalDeliveredValue,
    totalEarnings,
    orders: completedOrders // For list view
  };
}
