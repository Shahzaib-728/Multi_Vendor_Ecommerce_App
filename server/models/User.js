import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    receiverName: String,
    phone: String,
    street: String,
    area: String,
    city: String,
    province: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Customer', 'Seller', 'Admin', 'Delivery', 'Support'],
        default: 'Customer'
    },
    phoneNumber: String,
    profileImage: String,

    // Delivery Partner Specifics
    serviceAreas: [String], // ["Lahore", "Karachi"]
    isProfileComplete: { type: Boolean, default: false },

    // Wallet for Sellers and Delivery Partners
    walletBalance: { type: Number, default: 0 },

    // Customer specific
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Seller specific
    sellerDetails: {
        storeName: String,
        storeDescription: String,
        businessAddress: String,
        businessPhone: String,
        category: String,

        bankDetails: {
            bankName: String,
            accountHolder: String,
            accountNumber: String,
            swiftRoutingCode: String
        },

        ntnNumber: String,
        strnNumber: String,

        documents: {
            taxId: String,
            proofOfIdentity: String // URL to uploaded file
        },

        approvalStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        termsAccepted: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now }
    },
    // Store pending updates for approval
    pendingSellerDetails: {
        storeName: String,
        storeDescription: String,
        businessAddress: String,
        businessPhone: String,
        category: String,
        bankDetails: {
            bankName: String,
            accountHolder: String,
            accountNumber: String,
            swiftRoutingCode: String
        },
        ntnNumber: String,
        strnNumber: String,
        documents: {
            taxId: String
        }
    },

    // Delivery Partner specific
    vehicleDetails: {
        vehicleType: String, // Bike, Van, etc.
        licensePlate: String,
    },
    deliveryStatus: {
        type: String,
        enum: ['Available', 'Busy', 'Offline'],
        default: 'Offline'
    },
    currentLocation: {
        lat: Number,
        lng: Number
    },

    // Support specific
    assignedTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    createdAt: { type: Date, default: Date.now }
});

// Performance Indexes
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
