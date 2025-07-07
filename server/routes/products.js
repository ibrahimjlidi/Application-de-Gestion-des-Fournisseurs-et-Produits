const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   GET api/products/:id
// @desc    Get a single product
// @access  Public
router.get('/:id', getProductById);

// @route   POST api/products
// @desc    Create a product
// @access  Private (Admin)
router.post('/', [auth, isAdmin], createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (Admin)
router.put('/:id', [auth, isAdmin], updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private (Admin)
router.delete('/:id', [auth, isAdmin], deleteProduct);

module.exports = router; 