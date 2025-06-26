const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Supplier = require('../models/Supplier');

// @route   POST api/suppliers
// @desc    Create a supplier
router.post('/', [auth, isAdmin], async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        const supplier = await newSupplier.save();
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/suppliers
// @desc    Get all suppliers
router.get('/', auth, async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/suppliers/:id
// @desc    Get a single supplier
router.get('/:id', auth, async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/suppliers/:id
// @desc    Update a supplier
router.put('/:id', [auth, isAdmin], async (req, res) => {
    try {
        let supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(supplier);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/suppliers/:id
// @desc    Delete a supplier
router.delete('/:id', [auth, isAdmin], async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ msg: 'Supplier not found' });
        }
        await supplier.remove();
        res.json({ msg: 'Supplier removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router; 