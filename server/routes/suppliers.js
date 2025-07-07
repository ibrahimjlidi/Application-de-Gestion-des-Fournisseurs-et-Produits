const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { 
    getSuppliers, 
    getSupplierById, 
    createSupplier, 
    updateSupplier, 
    deleteSupplier 
} = require('../controllers/supplierController');

// @route   GET api/suppliers
// @desc    Get all suppliers
// @access  Public
router.get('/', getSuppliers);

// @route   GET api/suppliers/:id
// @desc    Get supplier by ID
// @access  Public
router.get('/:id', getSupplierById);

// @route   POST api/suppliers
// @desc    Create a supplier
// @access  Private (Admin)
router.post('/', [auth, isAdmin], createSupplier);

// @route   PUT api/suppliers/:id
// @desc    Update a supplier
// @access  Private (Admin)
router.put('/:id', [auth, isAdmin], updateSupplier);

// @route   DELETE api/suppliers/:id
// @desc    Delete a supplier
// @access  Private (Admin)
router.delete('/:id', [auth, isAdmin], deleteSupplier);

module.exports = router; 