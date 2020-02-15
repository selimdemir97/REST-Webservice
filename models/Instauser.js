const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    insta_profile:String,
    biography:String,
    profile_pic_url:String,
    followedby:Number,
    follwos:Number,
    full_name:String
});

module.exports = mongoose.model("Instauser",userSchema,'instauser');