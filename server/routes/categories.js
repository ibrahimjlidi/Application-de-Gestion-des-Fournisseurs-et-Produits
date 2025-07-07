const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { 
    getCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', getCategoryById);

// @route   POST api/categories
// @desc    Create a category
// @access  Private (Admin)
router.post('/', [auth, isAdmin], createCategory);

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/:id', [auth, isAdmin], updateCategory);

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', [auth, isAdmin], deleteCategory);

module.exports = router; 