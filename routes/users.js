const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../passport');

passportConf();

const { validateBody, schemas } = require('../helpers/routeHelpers');
const UsersController = require('../controllers/users');

const passportSignIn = passport.authenticate('local', { session: false });
const passportGoogle = passport.authenticate('googleToken', { session: false });
const passportFacebook = passport.authenticate('facebookToken', { session: false });
const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/signup')
    .post(validateBody(schemas.authSchema), UsersController.signUp);

router.route('/signin')
    .post(validateBody(schemas.authSchema), passportSignIn, UsersController.signIn);

router.route('/signout')
    .get(passportJWT, UsersController.signOut);

router.route('/oauth/google')
    .post(passportGoogle, UsersController.googleOAuth);

router.route('/oauth/facebook')
    .post(passportFacebook, UsersController.facebookOAuth);

router.route('/dashboard')
    .get(passportJWT, UsersController.dashboard);

router.route('/status')
    .get(passportJWT, UsersController.checkAuth);

router.route('/accessToken')
    .get(passportJWT, UsersController.accessToken);

module.exports = router;