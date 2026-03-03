const express = require('express');
const router = express.Router();
const { signup, signin, signOut } = require('../controllers/user');

// POST /user/signup
router.post('/signup', signup);

// POST /user/signin
router.post('/signin', signin);

// POST /user/signout   (using POST is common with cookies)
router.post('/signout', signOut);

module.exports = router;