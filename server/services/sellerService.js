import Product from '../models/Product.js';
import Order from '../models/Order.js';

export async function addSellerProduct(userId, productData) {
  const product = new Product({
    ...productData,
    seller: userId,
  });
  return await product.save();
}

export async function listSellerProducts(userId) {
  return await Product.find({ seller: userId }).lean();
}

export async function removeSellerProduct(userId, productId) {
  const product = await Product.findOneAndDelete({ _id: productId, seller: userId });
  if (!product) {
    throw new Error('Product not found or unauthorized');
  }
  return { success: true };
}

export async function updateSellerProduct(userId, productId, productData) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, seller: userId },
    { $set: productData },
    { new: true }
  );
  if (!product) {
    throw new Error('Product not found or unauthorized');
  }
  return product;
}

export async function getSellerStats(userId) {
  const mongoose = await import('mongoose');
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const products = await Product.countDocuments({ seller: userId });

  // 1. Total Revenue (Net Amount) - Using Aggregation for robustness
  const revenueAgg = await Order.aggregate([
    { $match: { seller: userObjectId, orderStatus: { $ne: 'Refunded' } } },
    { $group: { _id: null, total: { $sum: "$netAmount" } } }
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  // Total Orders count from aggregation to be consistent
  const ordersCount = await Order.countDocuments({ seller: userObjectId, orderStatus: { $ne: 'Refunded' } });

  // 2. Chart Data (Revenue per Day - Last 7 Days)
  const chartData = await Order.aggregate([
    { $match: { seller: userObjectId, orderStatus: { $ne: 'Refunded' } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$netAmount" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 7 }
  ]);

  // Transform chartData for frontend (Mon, Tue, etc.)
  const formattedChartData = chartData.map(d => {
    const date = new Date(d._id);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: d.revenue,
      orders: d.orders
    };
  });

  // 3. Top Selling Products
  const topProductsAgg = await Order.aggregate([
    { $match: { seller: userObjectId, orderStatus: { $ne: 'Refunded' } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        sales: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { sales: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    {
      $project: {
        name: "$productInfo.name",
        sales: 1,
        revenue: 1,
        image: {
          $ifNull: [
            "$productInfo.image",
            { $arrayElemAt: ["$productInfo.images", 0] }
          ]
        },
        stock: "$productInfo.stock",
        price: "$productInfo.price"
      }
    }
      
    
  ]);

// Category Distribution (New)
const categoryAgg = await Order.aggregate([
  { $match: { seller: userObjectId, orderStatus: { $ne: 'Refunded' } } },
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

// 4. Refunded Stats
const refundAgg = await Order.aggregate([
  { $match: { seller: userObjectId, orderStatus: 'Refunded' } },
  {
    $group: {
      _id: null,
      count: { $sum: 1 },
      total: { $sum: "$netAmount" }
    }
  }
]);
const refundedCount = refundAgg.length > 0 ? refundAgg[0].count : 0;
const refundedAmount = refundAgg.length > 0 ? refundAgg[0].total : 0;

return {
  products,
  totalOrders: ordersCount,
  revenue: totalRevenue,
  refundedCount,
  refundedAmount,
  chartData: formattedChartData,
  topProducts: topProductsAgg
};
}

export async function requestSellerProfileUpdate(userId, data) {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Store update in pendingSellerDetails
  user.pendingSellerDetails = {
    ...data.sellerDetails, // Expecting full sellerDetails object or partial
    approvalStatus: 'Pending' // Explicitly set to pending
  };

  return await user.save();
}
