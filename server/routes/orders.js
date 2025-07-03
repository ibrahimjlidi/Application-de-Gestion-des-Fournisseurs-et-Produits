const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// @route   GET api/orders
// @desc    Get all orders (admin) or user's orders (client/fournisseur)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            orders = await Order.find()
                .populate('client', 'firstName lastName email')
                .populate('supplier', 'firstName lastName email')
                .populate('products.product', 'name price image')
                .sort({ orderDate: -1 });
        } else if (req.user.role === 'fournisseur') {
            orders = await Order.find({ supplier: req.user.id })
                .populate('client', 'firstName lastName email')
                .populate('products.product', 'name price image')
                .sort({ orderDate: -1 });
        } else {
            orders = await Order.find({ client: req.user.id })
                .populate('supplier', 'firstName lastName email')
                .populate('products.product', 'name price image')
                .sort({ orderDate: -1 });
        }
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('client', 'firstName lastName email address')
            .populate('supplier', 'firstName lastName email')
            .populate('products.product', 'name price image description');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check if user has access to this order
        if (req.user.role !== 'admin' && 
            order.client.toString() !== req.user.id && 
            order.supplier.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Private (clients only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ msg: 'Only clients can create orders' });
        }

        const { products, supplier, shippingAddress, notes } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ msg: 'Products are required' });
        }

        // Calculate totals and validate products
        let subtotal = 0;
        const orderProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ msg: `Product ${item.product} not found` });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({ msg: `Insufficient stock for ${product.name}` });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderProducts.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price,
                subtotal: itemSubtotal
            });
        }

        const taxes = subtotal * 0.1; // 10% tax
        const total = subtotal + taxes;

        const order = new Order({
            products: orderProducts,
            client: req.user.id,
            supplier,
            subtotal,
            taxes,
            total,
            shippingAddress,
            notes
        });

        await order.save();

        // Update product quantities
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('client', 'firstName lastName email')
            .populate('supplier', 'firstName lastName email')
            .populate('products.product', 'name price image');

        res.json(populatedOrder);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private (admin and supplier)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && order.supplier.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        order.status = status;
        if (status === 'shipped') {
            order.expectedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('client', 'firstName lastName email')
            .populate('supplier', 'firstName lastName email')
            .populate('products.product', 'name price image');

        res.json(populatedOrder);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/orders/stats/supplier
// @desc    Get supplier statistics
// @access  Private (fournisseur)
router.get('/stats/supplier', auth, async (req, res) => {
    try {
        if (req.user.role !== 'fournisseur') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const totalOrders = await Order.countDocuments({ supplier: req.user.id });
        const pendingOrders = await Order.countDocuments({ 
            supplier: req.user.id, 
            status: 'pending' 
        });
        const completedOrders = await Order.countDocuments({ 
            supplier: req.user.id, 
            status: 'delivered' 
        });

        const totalRevenue = await Order.aggregate([
            { $match: { supplier: req.user.id, status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 