const mongoose = require('mongoose');

var entityTypes = ["Casino","Winery","Nightlife","Animal Park","Tourist Attraction","Museum","Amusement Park","Historical Monument"]

const challengeSchema = mongoose.Schema({
    casino:Number,
    winery:Number,
    nightlife:Number,
    animalPark:Number,
    touristAttraction:Number,
    museum:Number,
    amusementPark:Number,
    historicalMonument:Number,
    user:String
});

module.exports = mongoose.model("Challenges",challengeSchema,'challenges');
