const mongoose = require('mongoose');

const friendsSchema = mongoose.Schema({
    request_sender:String,
    request_getter:String,
    added:Boolean
});

module.exports = mongoose.model("Friends",friendsSchema,'friends');