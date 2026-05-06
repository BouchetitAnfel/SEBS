const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');


//public one for public access
router.post('/register', userController.register);
router.post('/login', userController.login);

//that need passway through middleware
router.get('/profile' , protect , userController.getProfile );
router.put('/update' , protect , userController.updateProfile);

module.exports = router;