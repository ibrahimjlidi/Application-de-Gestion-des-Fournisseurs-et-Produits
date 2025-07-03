const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    delivererId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
        default: 'pending'
    },
    pickupDate: {
        type: Date
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    },
    signature: {
        type: String,
        default: ''
    },
    trackingNumber: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Generate tracking number before saving
deliverySchema.pre('save', async function(next) {
    if (this.isNew && !this.trackingNumber) {
        const count = await this.constructor.countDocuments();
        this.trackingNumber = `TRK-${Date.now()}-${count + 1}`;
    }
    next();
});

module.exports = mongoose.model('Delivery', deliverySchema); 