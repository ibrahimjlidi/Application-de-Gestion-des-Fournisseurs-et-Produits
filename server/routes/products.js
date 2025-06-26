const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Product = require('../models/Product');

// @route   POST api/products
// @desc    Create a product
router.post('/', [auth, isAdmin], async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products
// @desc    Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('supplier', 'name');
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products/:id
// @desc    Get a single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier', 'name');
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/products/:id
// @desc    Update a product
router.put('/:id', [auth, isAdmin], async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
router.delete('/:id', [auth, isAdmin], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        await product.remove();
        res.json({ msg: 'Product removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router; 