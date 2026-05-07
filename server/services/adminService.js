import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import bcrypt from 'bcryptjs';

// Helper to create user
const createRoleUser = async (data, role) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new Error('Email already exists');

  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const user = new User({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: role,
    phoneNumber: data.phoneNumber
  });
  return await user.save();
};

export async function addDeliveryPartnerService(data) {
  return await createRoleUser(data, 'Delivery');
}

export async function addSupportAgentService(data) {
  return await createRoleUser(data, 'Support');
}

export async function listUsers() {
  return await User.find({ role: { $ne: 'Admin' } })
    .select('-password')
    .lean();
}

export async function deleteUserById(id) {
  // For delivery partners and support agents created by admin, allow deletion
  const user = await User.findById(id);
  // Optional: Check if user exists. findByIdAndDelete returns null if not found anyway, 
  // but checking first allows explicit error.
  if (!user) throw new Error('User not found');

  // Hard delete
  // Cleanup: Delete products if user is a seller
  if (user.role === 'Seller') {
    await Product.deleteMany({ seller: id });
  }

  await User.findByIdAndDelete(id);
  return { success: true, message: 'User and associated data deleted successfully' };
}



export async function listPendingSellers() {
  return await User.find({
    role: 'Seller',
    'sellerDetails.approvalStatus': 'Pending'
  })
    .select('-password')
    .lean();
}

export async function approveSellerById(id) {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');

  if (!user.sellerDetails) {
    throw new Error('User is not a seller');
  }

  user.sellerDetails.approvalStatus = 'Approved';
  await user.save();
  return { success: true, message: 'Seller approved successfully' };
}

export async function assignOrderToPartner(orderId, deliveryPartnerId) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  // Verify partner exists and is Delivery role
  const partner = await User.findById(deliveryPartnerId);
  if (!partner || partner.role !== 'Delivery') {
    throw new Error('Invalid delivery partner');
  }

  // Update order
  order.deliveryPartner = deliveryPartnerId;
  order.orderStatus = 'Shipped'; // Auto-advance status to Shipped or Ready for Pickup if needed
  // Let's keep it flexible or set to 'Processing' if not ready. 
  // But usually assigning means shipping. Let's set to 'Shipped' for simplicity demo.
  // Actually, 'Ready for Pickup' (Processing) -> delivery partner picks up -> In Transit (Shipped).
  // Let's NOT change status automatically, or set to 'Shipped' to indicate it's handed over conceptually.
  // Let's stick to just assignment.
  await order.save();

  return { success: true, message: 'Order assigned successfully' };
}
// ... assignOrderToPartner function

export async function listAllOrdersService() {
  return await Order.find({})
    .populate('customer', 'name email')
    .populate('deliveryPartner', 'name email phoneNumber')
    .sort({ createdAt: -1 })
    .lean();
}

// --- Payouts & Revenue ---

export async function getPayoutsService() {
  // Return users (Sellers & Delivery) with positive wallet balance
  const users = await User.find({
    walletBalance: { $gt: 0 },
    role: { $in: ['Seller', 'Delivery'] }
  })
    .select('name email role sellerDetails.storeName sellerDetails.bankDetails walletBalance vehicleDetails')
    .lean();

  return users.map(u => ({
    userId: u._id,
    name: u.name,
    role: u.role,
    storeName: u.sellerDetails?.storeName,
    bankDetails: u.sellerDetails?.bankDetails,
    walletBalance: u.walletBalance
  }));
}

export async function settlePayoutService(userId) {
  // 1. Reset Wallet Balance
  await User.findByIdAndUpdate(userId, { walletBalance: 0 });

  // 2. Mark associated ReadyForPayout orders as Paid (for audit)
  // Logic: "Paid" in Order context now means "Payout Settled by Admin"
  if ((await User.findById(userId)).role === 'Seller') {
    await Order.updateMany(
      { seller: userId, payoutStatus: 'ReadyForPayout' },
      { payoutStatus: 'Paid' }
    );
  }
  // Note: For Delivery Partners, we don't have a direct link in Order to payoutStatus easily 
  // without searching all orders. But since we pay based on Wallet Balance, exact order tracking 
  // is less critical for the payout action itself, but good for audit. 
  // For now, we mainly reset the wallet.

  return { success: true };
}

// Updated Analytics with Real Data and Analysis
export async function analyticsSummary() {
  const totalUsers = await User.countDocuments();
  const activeSellers = await User.countDocuments({ role: 'Seller', 'sellerDetails.approvalStatus': 'Approved' });

  // Base Match for valid revenue-generating orders
  const validOrderMatch = { orderStatus: { $nin: ['Cancelled'] } }; // More permissive for now

  // Calculate Total Platform Metrics
  const revenueAgg = await Order.aggregate([
    { $match: validOrderMatch },
    {
      $group: {
        _id: null,
        totalSales: { $sum: { $ifNull: ['$totalAmount', 0] } },
        platformProfit: { $sum: { $ifNull: ['$platformFee', 0] } }
      }
    }
  ]);

  const totalSales = revenueAgg.length > 0 ? revenueAgg[0].totalSales : 0;
  const platformProfit = revenueAgg.length > 0 ? revenueAgg[0].platformProfit : 0;

  // Refunded Stats
  const refundAgg = await Order.aggregate([
    { $match: { orderStatus: 'Refunded' } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' }
      }
    }
  ]);
  const totalRefundedCount = refundAgg.length > 0 ? refundAgg[0].count : 0;
  const totalRefundedAmount = refundAgg.length > 0 ? refundAgg[0].total : 0;

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const revenueHistory = await Order.aggregate([
    { $match: { ...validOrderMatch, createdAt: { $gte: last7Days } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        value: { $sum: { $ifNull: ['$platformFee', 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Format weekday names for chart
  const formattedRevenueHistory = revenueHistory.map(item => {
    const date = new Date(item._id);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: parseFloat(item.value.toFixed(2))
    };
  });

  // Category Distribution
  const categoryAgg = await Order.aggregate([
    { $match: validOrderMatch },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $group: {
        _id: '$productInfo.category',
        value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { value: -1 } }
  ]);

  const categoryDistribution = categoryAgg.map(item => ({
    name: item._id || 'Uncategorized',
    value: parseFloat(item.value.toFixed(2))
  }));

  // Top Selling Products (Overall)
  const topProducts = await Order.aggregate([
    { $match: validOrderMatch },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        _id: 1,
        name: '$productInfo.name',
        image: '$productInfo.image',
        price: '$productInfo.price',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);

  // Recent Global Transactions
  const recentTransactions = await Transaction.find({})
    .populate('user', 'name role')
    .populate({
      path: 'order',
      populate: { path: 'seller', select: 'name' }
    })
    .sort({ createdAt: -1 })
    .limit(10);

  // Aggregation for roles
  const roleBreakdown = {};
  (await User.find({}, 'role')).forEach(u => {
    roleBreakdown[u.role] = (roleBreakdown[u.role] || 0) + 1;
  });

  return {
    roleBreakdown,
    totalUsers,
    activeSellers,
    totalOrders: await Order.countDocuments(validOrderMatch),
    deliveredOrders: await Order.countDocuments({ orderStatus: 'Delivered' }),
    totalSales,
    platformProfit, // Correct name
    totalRefundedCount,
    totalRefundedAmount,
    revenueHistory: formattedRevenueHistory,
    categoryDistribution,
    topProducts,
    recentTransactions,
    pendingSellers: await User.countDocuments({ 'sellerDetails.approvalStatus': 'Pending' })
  };
}
