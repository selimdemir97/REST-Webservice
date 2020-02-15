const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    insta_profile: String,
    user_id: String,
    biography:String,
    profile_pic_url:String,
    followedby:Number,
    follwos:Number,
    full_name:String,
});

// Create a model
const Profile = mongoose.model('profile', profileSchema);

// Export the model
module.exports = Profile;
