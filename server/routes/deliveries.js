const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getDeliveries, 
    getDeliveryById, 
    createDelivery, 
    updateDelivery, 
    deleteDelivery 
} = require('../controllers/deliveryController');

// @route   GET api/deliveries
// @desc    Get all deliveries
// @access  Private
router.get('/', auth, getDeliveries);

// @route   GET api/deliveries/:id
// @desc    Get delivery by ID
// @access  Private
router.get('/:id', auth, getDeliveryById);

// @route   POST api/deliveries
// @desc    Create a delivery
// @access  Private
router.post('/', auth, createDelivery);

// @route   PUT api/deliveries/:id
// @desc    Update a delivery
// @access  Private
router.put('/:id', auth, updateDelivery);

// @route   DELETE api/deliveries/:id
// @desc    Delete a delivery
// @access  Private
router.delete('/:id', auth, deleteDelivery);

module.exports = router; 