
const express = require('express');
const router = express.Router();
const { getGigs, getGigById, createGig, getMyGigs } = require('../controllers/gigController');
const { protect } = require('../middleware/auth');

router.get('/', getGigs);
router.get('/my/posted', protect, getMyGigs);
router.get('/:id', getGigById);
router.post('/', protect, createGig);

module.exports = router;