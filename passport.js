const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const User = require('./models/user');

const cookieExtractor = req => {
    let token = null;
    
    if (req && req.cookies) {
        console.log('req.cookies', req.cookies);
        token = req.cookies['access_token'];
    }

    return token;
}

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'restful',
    // passReqToCallback: true
}, async (payload, done) => {
    try {
        // find the user specified in token
        const user = await User.findById(payload.sub);

        // if user doesn't exists, handle it
        if(!user) {
            return done(null, false);
        }

        // otherwise return the user
        done(null, user);

    } catch (error) {
        done(error, false)
    }
}));

// FACEBOOK OAUTH STRATEGY
module.exports = function () {
    passport.use('facebookToken', new FacebookTokenStrategy({
        clientID: '472380023411078',
        clientSecret: '370d7566df25d121f0d3ad8c72001a51'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('accessToken', accessToken);
            console.log('refreshToken', refreshToken);
            console.log('profile', profile);

            const existingUser = await User.findOne({ "facebook.id": profile.id });

            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = new User({
                method: 'facebook',
                facebook: {
                    id: profile.id,
                    email: profile.emails[0].value,
                    token: accessToken
                }
            });

            await newUser.save();
            done(null, newUser);

        } catch (error) {
            done(error, false, error.message);
        }
    }));
}

// GOOGLE OAUTH STRATEGY
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: '27705461449-b63m5si8bbqbood7k1t6f0f3j7a6g6uv.apps.googleusercontent.com',
    clientSecret: 'AVAn9Rar7R75wcgPpuT9NTDB'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        console.log('profile', profile);
    
        // check whether this current user is already in DB
        const existingUser = await User.findOne({ "google.id": profile.id });
    
        if (existingUser) {
            console.log('User already exists in DB')
            return done(null, existingUser);
        }

        console.log('User doesn\'t exists in DB, created a new one');
    
        // if new account
        const newUser = new User({
            method: 'google',
            google: {
                id: profile.id,
                email: profile.emails[0].value
            }
        });
    
        await newUser.save();
        done(null, newUser);
        
    } catch (error) {
        done(error, false, error.message);
    }

}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        // find the user given the email
        const user = await User.findOne({ "local.email": email });
    
        // if not, handle it
        if(!user) {
            return done(null, false);
        }
    
        // check if the password is correct
        const isMatch = await user.isValidPassword(password);
    
        // if not, handle it
        if(!isMatch) {
            return done(null, false);
        }
    
        // otherwise, return the user
        done(null, user);
        
    } catch (error) {
        done(error, false);
    }

}));