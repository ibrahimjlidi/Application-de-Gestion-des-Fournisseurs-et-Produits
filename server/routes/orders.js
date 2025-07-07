const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getOrders, 
    getOrderById, 
    createOrder, 
    updateOrder, 
    deleteOrder 
} = require('../controllers/orderController');

// @route   GET api/orders
// @desc    Get all orders
// @access  Private
router.get('/', auth, getOrders);

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   POST api/orders
// @desc    Create an order
// @access  Private
router.post('/', auth, createOrder);

// @route   PUT api/orders/:id
// @desc    Update an order
// @access  Private
router.put('/:id', auth, updateOrder);

// @route   DELETE api/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/:id', auth, deleteOrder);

module.exports = router; 