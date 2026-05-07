import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendResetEmail } from './emailService.js';

export async function forgotPasswordService(email) {
  const user = await User.findOne({ email });

  // Always return the same message for security reasons
  if (!user) return true;

  // Create reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (1 hour)
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  await user.save();

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  try {
    await sendResetEmail(user.email, resetUrl);
    return true;
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error('Email could not be sent');
  }
}

export async function resetPasswordService(token, password) {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error('Invalid or expired token');
    error.status = 400;
    throw error;
  }

  // Set new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return true;
}

export async function registerUser({ name, email, password, role, storeDetails }) {
  // Validate name
  if (!name || name.trim().length < 2) {
    const error = new Error('Name must be at least 2 characters long');
    error.status = 400;
    throw error;
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    const error = new Error('Please provide a valid email address');
    error.status = 400;
    throw error;
  }

  // Validate password length
  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.status = 400;
    throw error;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    const error = new Error('This email address is already registered. Please login instead.');
    error.status = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'Customer',
    sellerDetails: role === 'Seller' ? storeDetails : undefined
  });

  return {
    message: 'User registered successfully. Please login to continue.',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        sellerDetails: user.sellerDetails,
        serviceAreas: user.serviceAreas,
        vehicleDetails: user.vehicleDetails,
        phoneNumber: user.phoneNumber,
        isProfileComplete: user.isProfileComplete
      },
      token,
    };
  } else {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
}
export async function updateUserService(userId, { name, email, password, address, sellerDetails, serviceAreas, vehicleDetails, phoneNumber }) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phoneNumber = phoneNumber || user.phoneNumber;

  // Delivery Partner Updates
  if (serviceAreas) user.serviceAreas = serviceAreas;
  if (vehicleDetails) user.vehicleDetails = vehicleDetails;

  // Check profile completion for Delivery
  if (user.role === 'Delivery') {
    const hasAreas = user.serviceAreas && user.serviceAreas.length > 0;
    const hasVehicle = user.vehicleDetails && user.vehicleDetails.licensePlate;
    user.isProfileComplete = !!(hasAreas && hasVehicle);
  }

  if (sellerDetails) {
    console.log('Updating seller details for:', userId, sellerDetails);

    // NTN Validation (1234567-8)
    if (sellerDetails.ntnNumber && !/^\d{7}-\d{1}$/.test(sellerDetails.ntnNumber)) {
      const error = new Error('Invalid NTN format. Must be 1234567-8');
      error.status = 400;
      throw error;
    }

    // STRN Validation (13 digits)
    if (sellerDetails.strnNumber && !/^\d{13}$/.test(sellerDetails.strnNumber)) {
      const error = new Error('Invalid STRN format. Must be 13 digits');
      error.status = 400;
      throw error;
    }

    // Bank Account Number (Min 10 digits)
    if (sellerDetails.bankDetails?.accountNumber && sellerDetails.bankDetails.accountNumber.length < 10) {
      const error = new Error('Account number must be at least 10 digits');
      error.status = 400;
      throw error;
    }

    // Construct new object to ensure Mongoose detects change
    user.sellerDetails = {
      ...sellerDetails,
      // Backward compatibility for old field names if any
      ntnNumber: sellerDetails.ntnNumber || sellerDetails.panNumber,
      strnNumber: sellerDetails.strnNumber || sellerDetails.gstNumber,
      approvalStatus: 'Pending',
      joinedAt: user.sellerDetails?.joinedAt || new Date()
    };
    // Explicitly mark as modified just in case
    user.markModified('sellerDetails');
  }

  if (address) {
    if (!user.addresses) user.addresses = [];

    if (user.addresses.length > 0) {
      // Update existing default address
      const existing = user.addresses[0];
      existing.receiverName = address.receiverName || existing.receiverName;
      existing.phone = address.phone || existing.phone;
      existing.street = address.street || existing.street;
      existing.area = address.area || existing.area;
      existing.city = address.city || existing.city;
      existing.province = address.province || existing.province;
      existing.zipCode = address.zipCode || existing.zipCode;
      // Using 'Pakistan' as default if not provided, or keeping existing
      existing.country = address.country || existing.country || 'Pakistan';
    } else {
      // Add new address
      user.addresses.push({
        receiverName: address.receiverName,
        phone: address.phone,
        street: address.street,
        area: address.area,
        city: address.city,
        province: address.province,
        zipCode: address.zipCode,
        country: address.country || 'Pakistan',
        isDefault: true
      });
    }
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    addresses: updatedUser.addresses,
    sellerDetails: updatedUser.sellerDetails,
    serviceAreas: updatedUser.serviceAreas,
    vehicleDetails: updatedUser.vehicleDetails,
    phoneNumber: updatedUser.phoneNumber,
    isProfileComplete: updatedUser.isProfileComplete
  };
}

export async function getUserService(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    addresses: user.addresses,
    sellerDetails: user.sellerDetails,
    serviceAreas: user.serviceAreas,
    vehicleDetails: user.vehicleDetails,
    phoneNumber: user.phoneNumber,
    isProfileComplete: user.isProfileComplete
  };
}
