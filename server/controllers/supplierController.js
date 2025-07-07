const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (err) {
        console.error('Get suppliers error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Public
exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        
        res.json(supplier);
    } catch (err) {
        console.error('Get supplier by ID error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private (Admin)
exports.createSupplier = async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        const supplier = await newSupplier.save();
        res.json(supplier);
    } catch (err) {
        console.error('Create supplier error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin)
exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        
        res.json(supplier);
    } catch (err) {
        console.error('Update supplier error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Supplier removed' });
    } catch (err) {
        console.error('Delete supplier error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        res.status(500).send('Server error');
    }
}; 