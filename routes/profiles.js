const express = require('express');
const router = require('express-promise-router')();

const ProfileController = require('../controllers/profiles');

router.route('/:id/username/:name')
    .post(ProfileController.createProfile);

router.route('/:token')
    .get(ProfileController.getProfile);

router.route('/username/:user')
    .get(ProfileController.getForeignProfile);
    
router.route('/:id')
    .put(ProfileController.updateProfile);

router.route('/:id')
    .delete(ProfileController.deleteProfile);

module.exports = router;