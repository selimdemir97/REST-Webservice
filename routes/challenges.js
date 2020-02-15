const express = require('express');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mc = require('mongoose');
var conn = mc.connection;
const Challenges = require('../models/Challenges');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const request = require('request');

var entityTypes = ["Casino","Winery","Nightlife","Animal Park","Tourist Attraction","Museum","Amusement Park","Historical Monument"]

function bubbleSort(arr){
    var len = arr.length;
    for (var i = len-1; i>=0; i--){
      for(var j = 1; j<=i; j++){
        if(arr[j-1].count>arr[j].count){
            var temp = arr[j-1];
            arr[j-1] = arr[j];
            arr[j] = temp;
         }
      }
    }
    return arr;
 }

 Array.prototype.count = function(obj){
    var count = this.length;
    if(typeof(obj) !== "undefined"){
      var array = this.slice(0), count = 0; 
      for(i = 0; i < array.length; i++){
        if(array[i] == obj){ count++ }
      }
    }
    return count;
}

function updateChallenge(name,eT){
    for(var i=0;i<eT.length;i++){
          switch(eT[i]){
                case entityTypes[0]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.casino+1;
                        console.log(doc.casino+ " | "+ b)
                        doc.casino=b;
                        doc.save();
                    });
                    break;
                case entityTypes[1]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.winery+1;
                        doc.winery=b;
                        doc.save();
                    });
                    break;
                case entityTypes[2]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.nightlife+1;
                        console.log(doc.nightlife+ " | "+ b)
                        doc.nightlife=b;
                        doc.save();
                    });
                    break;
                case entityTypes[3]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.animalPark+1;
                        doc.animalPark=b;
                        doc.save();
                    });
                    break;
                case entityTypes[4]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.touristAttraction+1;
                        doc.touristAttraction=b;
                        doc.save();
                    });
                    break;
                case entityTypes[5]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.museum+1;
                        doc.museum=b;
                        doc.save();
                    });
                    break;
                case entityTypes[6]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.amusementPark+1;
                        doc.amusementPark=b;
                        doc.save();
                    });
                    break;
                case entityTypes[7]:
                    Challenges.findOne({user:name},function(err,doc){
                        var b = doc.historicalMonument+1;
                        doc.historicalMonument=b;
                        doc.save();
                    });
                    break;
        }
    }
    
}

router.post('/username/:user',(req,res)=>{
    try{
        const name = req.params.user;
        const eTypes = req.body.entityTypes;
        console.log(eTypes);
        Challenges.find({user:name},(err,doc)=>{
            if(!doc.length){
                const challenges = new Challenges({
                    casino:eTypes.count("Casino"),
                    winery:eTypes.count("Winery"),
                    nightlife:eTypes.count("Nightlife"),
                    animalPark:eTypes.count("Animal Park"),
                    touristAttraction:eTypes.count("Tourist Attraction"),
                    museum:eTypes.count("Museum"),
                    amusementPark:eTypes.count("Amusement Park"),
                    historicalMonument:eTypes.count("Historical Monument"),
                    user:name
                });
                challenges.save();
                return res.sendStatus(201); 
            }else{
                return res.sendStatus(409);
            }
        });
    }catch (err){
        return res.send(err);
    }
});

router.put('/username/:user',async(req,res)=>{
    try{
        var eT = req.body.entityTypes;
        const name = req.params.user;
        Challenges.findOne({user:name},(err,doc)=>{
            if(!doc){
                return res.sendStatus(404);
            }else{
                updateChallenge(name, eT)
                return res.sendStatus(200);
            }
        });    
    }catch (err){
        return res.send(err);
    }
});

router.put('/reset/username/:user',async(req,res)=>{
    try{
        const name = req.params.user;
        Challenges.findOne({user:name},function(err,doc){
            if(!doc){
                return res.sendStatus(404);
            }
            doc.casino=0;
            doc.winery=0;
            doc.nightlife=0;
            doc.animalPark=0;
            doc.touristAttraction=0;
            doc.museum=0;
            doc.amusementPark=0;
            doc.historicalMonument=0;
            doc.save();
            return res.sendStatus(200);
        });
    }catch(err){
        return res.send(err);
    }
});

router.get('/username/:user', async(req,res)=>{
    try{
        const username = req.params.user;
        const challenges = await Challenges.findOne({user:username});
        if(!challenges){
            return res.sendStatus(404);
        }
        res.json(200,challenges);
    }catch (err){
        return res.send(err);
    }
})

router.get('/ranking', async(req,res)=>{
    try{
        rankingMap = [];
        const challenges = await Challenges.find({});
        challenges.forEach((challenge) => {
            var a=0;
            a+=challenge.casino;
            a+=challenge.winery;
            a+=challenge.nightlife;
            a+=challenge.animalPark;
            a+=challenge.touristAttraction;
            a+=challenge.museum;
            a+=challenge.amusementPark;
            a+=challenge.historicalMonument;
            var model = {name:challenge.user,count:a};
            rankingMap.push(model);
        });
        if(!rankingMap.length){
            return res.sendStatus(404);
        }
        rankingMap = bubbleSort(rankingMap);
        rankingMap.reverse();
        return res.json(200,rankingMap);
    }catch (err){
        return res.send(err);
    }
});

router.get('/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        const challenges = await Challenges.find({_id:id.toObjectId()});
        if(!challenges){
            return res.sendStatus(404);
        }
        return res.json(200,challenges);
    }catch (err){
        return res.send(err);
    }
})

module.exports = router;