const mongoose = require('mongoose');

const picturesSchema = mongoose.Schema({
    location:String,
    url:String,
    user: String,
    date:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Pictures",picturesSchema,'pictures');
