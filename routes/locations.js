const express = require('express');
const assert = require('assert');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mc = require('mongoose');
var conn = mc.connection;
const Location = require('../models/Location');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const request =require('request');

router.post('/username/:user/location/:location',(req,res)=>{
    const name = req.params.location;
    const username=req.params.user;
    request('http://dev.virtualearth.net/REST/v1/Locations/'+name+'?o=json&key=Ag5kCqhuWajC19KdlQGJJwlyg3fdW_y_zYcnuu3YU2AsI0u0t0eYeqKTOVrohWMB',(error,response,body)=>{
        if(!error&&response.statusCode==200){
            body = JSON.parse(body)
            let x = body.resourceSets[0].resources[0].point.coordinates[0];
            let y = body.resourceSets[0].resources[0].point.coordinates[1];
            let entityType = body.resourceSets[0].resources[0].entityType;
            Location.findOne({name:name},function(err,doc){
                if(!doc){
                    const location = new Location({
                        name:name,
                        x:x,
                        y:y,
                        user:username,
                        entityType:entityType
                    });
                    location.save();
                    return res.sendStatus(201);
                }
                return res.sendStatus(409);
            });
            
        }else return res.sendStatus(404);
    })
})

/* Location update wird nicht benötigt, da geografische Daten vom WGS-84 abhängen.
   Deshalb ist eine Aktualisierung nur bei einem Wechsel des Refenrenzsystems vom API Anbieter möglich.
    
router.put('/oldname/:oldname/newname/:newname/user/:user', (req,res)=>{
    const name_old = req.params.oldname;
    const name_new = req.params.newname;
    const username = req.params.user;
    request('http://dev.virtualearth.net/REST/v1/Locations/'+name_new+'?o=json&key=Ag5kCqhuWajC19KdlQGJJwlyg3fdW_y_zYcnuu3YU2AsI0u0t0eYeqKTOVrohWMB',(error,response,body)=>{
        if(!error&&response.statusCode==200){
            body = JSON.parse(body)
            let x = body.resourceSets[0].resources[0].point.coordinates[0];
            let y = body.resourceSets[0].resources[0].point.coordinates[1];
            let entityType = body.resourceSets[0].resources[0].entityType;
            Location.findOne({name:name_old,username:username},function(err,doc){
                doc.name=name_new;
                doc.x=x;
                doc.y=y;
                doc.entityType=entityType;
                doc.save();
            });
            return res.status(200).send("Location updated");
        }else return res.status(400).send(error);
    })
});
*/

router.get('/username/:user', async(req,res)=>{
    try{
        const username = req.params.user;
        const locations = await Location.find({user:username});
        if(!locations.length){
            return res.sendStatus(404);
        }
        return res.json(200,locations);
    }catch (err){
        return res.json(err);
    }
});

router.get('/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        const locations = await Location.find({_id:id.toObjectId()});
        if(!locations.length){
            return res.sendStatus(404);
        }
        return res.json(200,locations);
    }catch (err){
        return res.json(err.statusCode,err);
    }
});

router.delete('/:id',async(req,res)=>{
    try{
        const objID = req.params.id.toString();
        await Location.findOne({_id:objID.toObjectId()},(err,doc)=>{
            if(!doc){
                return res.sendStatus(404);
            }
            doc.remove();
            doc.save();
            return res.sendStatus(200);
        });   
    }catch (err){
        return res.send(err);
    }
});


module.exports = router;

