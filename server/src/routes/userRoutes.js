const express = require('express');
const router = express.Router();
const { getProfile, changePassword, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getProfile);
router.put('/password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;
