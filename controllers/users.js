const JWT = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');

signToken = user => {
    // create a token
    return JWT.sign({
        iss: 'RESTful',         // optional
        sub: user.id,
        iat: new Date().getTime(),  // Erstellungszeit
        exp: new Date().setDate(new Date().getDate() + 1)   // Ablaufzeit
    }, 'restful');
}

module.exports = {
    signUp: async (req, res, next) => {        
        
        const { email, password } = req.value.body;

        // check if user already exist
        const foundUser = await User.findOne({ "local.email": email })
        if(foundUser) { 
            return res.status(403).json({ error: 'Email is already in use' }) 
        }

        // create a new user
        const newUser = new User({ 
            method: 'local',
            local: {
                email: email, 
                password: password
            }
        });
        await newUser.save();

        // generate the token
        const token = signToken(newUser);

        // send a cookie containing JWT
        res.cookie('access_token', token, {
            httpOnly: true
        });
        
        // respond with token
        res.status(200).json({ success: true });
    },

    signIn: async (req, res, next) => {
        // Generate Token
        const token = signToken(req.user);
        
        // send a cookie containing JWT
        res.cookie('access_token', token, {
            httpOnly: false
        });
        
        // respond with token
        res.status(200).json({ success: true });
    },

    signOut: async (req, res, next) => {
        res.clearCookie('access_token');
        // console.log('COOKIES!');
        res.json({ success: true });
    },

    googleOAuth: async (req, res, next) => {
        // Generate Token
        const token = signToken(req.user);
        
        // send a cookie containing JWT
        res.cookie('access_token', token, {
            httpOnly: true
        });
        
        // respond with token
        res.status(200).json({ success: true });
    },
    
    facebookOAuth: async (req, res, next) => {
        // Generate Token
        req.token = signToken(req.user);

        var findUser = { "facebook.id": req.user.facebook.id };
        console.log(findUser);

        var usr = await User.findOne(findUser);
        console.log(usr);

        await User.updateOne(findUser, {"facebook.token" : req.token } , function(err) {
            console.log(err);
        });

        // send a cookie containing JWT
        res.cookie('access_token', req.token, {
            httpOnly: true,
        });
        
        // respond with token
        res.status(200).json({ success: true });
    },

    dashboard: async (req, res, next) => {
        console.log('I managed to get here!');
        res.json({ secret: "ressource" });
    },
    
    checkAuth: async (req, res, next) => {
        console.log('COOKIES!');
        
        res.json({ success: true });
    },
    accessToken: async (req, res, next) => {
        token = req.cookies['access_token'];
        // res.json({ "accessToken" : token });

        const currentUser = await User.findOne({"facebook.token" : token } , function(err) {
            console.log(err);
        });
        res.json({ "userID" : currentUser.facebook.id })
    }
}