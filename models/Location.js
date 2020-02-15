const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    name:String,
    x: Number,
    y: Number,
    user: String,
    entityType: String,
    date:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Location",locationSchema,'places');
