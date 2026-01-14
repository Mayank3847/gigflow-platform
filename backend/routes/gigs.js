const express = require('express');
const router = express.Router();
const {
  getGigs,
  getGigById,
  createGig,
  getMyGigs
} = require('../controllers/gigController');
const { protect } = require('../middleware/auth');

router.get('/', getGigs);

// ✅ SUPPORT BOTH (NO BREAKING CHANGE)
router.get('/my-gigs', protect, getMyGigs);
router.get('/my/posted', protect, getMyGigs);

router.get('/:id', getGigById);
router.post('/', protect, createGig);

module.exports = router;
