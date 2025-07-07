const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .populate('supplier', 'name')
            .sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('supplier', 'name');
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        
        res.json(order);
    } catch (err) {
        console.error('Get order by ID error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Create an order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            user: req.user.id
        });
        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update an order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        
        res.json(order);
    } catch (err) {
        console.error('Update order error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        
        await Order.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Order removed' });
    } catch (err) {
        console.error('Delete order error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server error');
    }
}; 