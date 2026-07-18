const express = require('express');
const router = express.Router();
const { createRepository, getRepositories, getRepositoryById, updateRepository, deleteRepository } = require('../controllers/repositoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getRepositories).post(createRepository);
router.route('/:id').get(getRepositoryById).put(updateRepository).delete(deleteRepository);

module.exports = router;
