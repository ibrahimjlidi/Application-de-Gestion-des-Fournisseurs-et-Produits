const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name').populate('supplier', 'name');
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('supplier', 'name');
        
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        
        res.json(product);
    } catch (err) {
        console.error('Get product by ID error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin/Supplier)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin/Supplier)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        
        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server error');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Supplier)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error('Delete product error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server error');
    }
}; 