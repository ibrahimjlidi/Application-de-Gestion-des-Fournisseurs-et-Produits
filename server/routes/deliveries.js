const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// @route   GET api/deliveries
// @desc    Get all deliveries (admin) or user's deliveries (deliverer)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let deliveries;
        if (req.user.role === 'admin') {
            deliveries = await Delivery.find()
                .populate('orderId', 'orderNumber status total')
                .populate('delivererId', 'firstName lastName email')
                .sort({ createdAt: -1 });
        } else {
            deliveries = await Delivery.find({ delivererId: req.user.id })
                .populate('orderId', 'orderNumber status total')
                .sort({ createdAt: -1 });
        }
        res.json(deliveries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/deliveries/:id
// @desc    Get delivery by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('orderId', 'orderNumber status total shippingAddress')
            .populate('delivererId', 'firstName lastName email phone');

        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }

        // Check if user has access to this delivery
        if (req.user.role !== 'admin' && delivery.delivererId._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(delivery);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/deliveries
// @desc    Create a new delivery
// @access  Private (admin only)
router.post('/', [auth, isAdmin], async (req, res) => {
    try {
        const { orderId, delivererId, estimatedDeliveryDate, notes } = req.body;

        // Check if order exists and is ready for delivery
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.status !== 'shipped') {
            return res.status(400).json({ msg: 'Order must be shipped before creating delivery' });
        }

        // Check if delivery already exists for this order
        const existingDelivery = await Delivery.findOne({ orderId });
        if (existingDelivery) {
            return res.status(400).json({ msg: 'Delivery already exists for this order' });
        }

        const delivery = new Delivery({
            orderId,
            delivererId,
            deliveryAddress: order.shippingAddress,
            estimatedDeliveryDate,
            notes
        });

        await delivery.save();

        const populatedDelivery = await Delivery.findById(delivery._id)
            .populate('orderId', 'orderNumber status total')
            .populate('delivererId', 'firstName lastName email');

        res.json(populatedDelivery);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/deliveries/:id/status
// @desc    Update delivery status
// @access  Private (admin and deliverer)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && delivery.delivererId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        delivery.status = status;
        if (notes) delivery.notes = notes;

        // Update timestamps based on status
        if (status === 'picked_up') {
            delivery.pickupDate = new Date();
        } else if (status === 'delivered') {
            delivery.actualDeliveryDate = new Date();
            // Update order status to delivered
            await Order.findByIdAndUpdate(delivery.orderId, { status: 'delivered' });
        }

        await delivery.save();

        const populatedDelivery = await Delivery.findById(delivery._id)
            .populate('orderId', 'orderNumber status total')
            .populate('delivererId', 'firstName lastName email');

        res.json(populatedDelivery);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/deliveries/:id/signature
// @desc    Add delivery signature
// @access  Private (deliverer)
router.put('/:id/signature', auth, async (req, res) => {
    try {
        const { signature } = req.body;

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }

        // Check authorization
        if (delivery.delivererId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        delivery.signature = signature;
        await delivery.save();

        res.json(delivery);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/deliveries/stats/deliverer
// @desc    Get deliverer statistics
// @access  Private (deliverer)
router.get('/stats/deliverer', auth, async (req, res) => {
    try {
        const totalDeliveries = await Delivery.countDocuments({ delivererId: req.user.id });
        const pendingDeliveries = await Delivery.countDocuments({ 
            delivererId: req.user.id, 
            status: { $in: ['pending', 'assigned'] }
        });
        const completedDeliveries = await Delivery.countDocuments({ 
            delivererId: req.user.id, 
            status: 'delivered' 
        });
        const inTransitDeliveries = await Delivery.countDocuments({ 
            delivererId: req.user.id, 
            status: { $in: ['picked_up', 'in_transit'] }
        });

        res.json({
            totalDeliveries,
            pendingDeliveries,
            completedDeliveries,
            inTransitDeliveries
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 