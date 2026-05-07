import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import { getIO } from '../socket.js';

export async function createTicket(customerId, subject, category, initialMessage) {
  const ticket = new Ticket({
    customer: customerId,
    subject,
    category,
    messages: [{ sender: customerId, text: initialMessage }]
  });
  return await ticket.save();
}

export async function listTickets() {
  return await Ticket.find().populate('customer', 'name email').sort({ createdAt: -1 });
}

export async function getTicket(id) {
  return await Ticket.findById(id).populate('customer', 'name email').populate('messages.sender', 'name role');
}

export async function getActiveTicket(customerId) {
  return await Ticket.findOne({
    customer: customerId,
    status: { $ne: 'Closed' }
  }).sort({ createdAt: -1 }).populate('messages.sender', 'name role');
}

export async function addReply(id, userId, message, newStatus) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw new Error('Ticket not found');

  const newMessage = { sender: userId, text: message, timestamp: new Date() };
  ticket.messages.push(newMessage);
  if (newStatus) ticket.status = newStatus;
  ticket.updatedAt = new Date();

  await ticket.save();

  // Populate sender info for the socket event
  // We need to know who sent it to display correctly on FE
  // But for now, just sending the raw message object is okay if FE handles it.
  // Better to populate sender name/role
  const populatedTicket = await Ticket.findById(id).populate('messages.sender', 'name role');
  const savedMsg = populatedTicket.messages[populatedTicket.messages.length - 1];

  try {
    const io = getIO()
    io.to(`ticket_${id}`).emit('receive_message', savedMsg)
  } catch (e) {
    console.error('Socket emit failed', e)
  }

  return ticket;
}

export async function globalSearch(query) {
  let results = {
    order: null,
    user: null,
    seller: null
  };

  // 1. Try to find by Order ID
  if (mongoose.Types.ObjectId.isValid(query)) {
    const order = await Order.findById(query)
      .populate('customer', 'name email phoneNumber')
      .populate('seller', 'name email sellerDetails.storeName sellerDetails.businessPhone')
      .populate('items.product');
    if (order) {
      results.order = order;
      return results;
    }

    // Also try to find by User ID
    const user = await User.findById(query);
    if (user) {
      results.user = user;
      return results;
    }
  }

  // 2. Try to find by Email (User)
  const userByEmail = await User.findOne({ email: query });
  if (userByEmail) {
    results.user = userByEmail;
    if (userByEmail.role === 'Seller') {
      results.seller = userByEmail;
    }
  }

  // 3. Try to find by Tracking ID (Assuming it's part of the order status or similar)
  // For now, let's just search by Order ID and Email as requested.

  return results;
}
