const Delivery = require('../models/Delivery');

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private
exports.getDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find()
            .populate('order', 'orderNumber')
            .populate('supplier', 'name')
            .sort({ date: -1 });
        res.json(deliveries);
    } catch (err) {
        console.error('Get deliveries error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Get delivery by ID
// @route   GET /api/deliveries/:id
// @access  Private
exports.getDeliveryById = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('order', 'orderNumber')
            .populate('supplier', 'name');
        
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        
        res.json(delivery);
    } catch (err) {
        console.error('Get delivery by ID error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Create a delivery
// @route   POST /api/deliveries
// @access  Private
exports.createDelivery = async (req, res) => {
    try {
        const newDelivery = new Delivery(req.body);
        const delivery = await newDelivery.save();
        res.json(delivery);
    } catch (err) {
        console.error('Create delivery error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update a delivery
// @route   PUT /api/deliveries/:id
// @access  Private
exports.updateDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        
        res.json(delivery);
    } catch (err) {
        console.error('Update delivery error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Delete a delivery
// @route   DELETE /api/deliveries/:id
// @access  Private
exports.deleteDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id);
        
        if (!delivery) {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        
        await Delivery.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Delivery removed' });
    } catch (err) {
        console.error('Delete delivery error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Delivery not found' });
        }
        res.status(500).send('Server error');
    }
}; 