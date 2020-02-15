const express = require('express');
const assert = require('assert');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mc = require('mongoose');
var conn = mc.connection;
const Friends = require('../models/Friends');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const request = require('request');

router.post('/request_sender/:request_sender/request_getter/:request_getter',(req,res)=>{
    try{
        const request_sender = req.params.request_sender;
        const request_getter = req.params.request_getter;
        Friends.find({request_sender:request_sender, request_getter:request_getter},function(err,doc){
            if(doc.length){
                return res.sendStatus(409);
            }else{
                const friend = new Friends({
                    request_getter:request_getter,
                    request_sender:request_sender,
                    added:false
                });
                friend.save();
                return res.sendStatus(201);
            }
        });
        
    }catch (err){
        return res.send(err);
    }
});

router.put('/request_sender/:request_sender/request_getter/:request_getter',(req,res)=>{
    try{
        const request_getter = req.params.request_getter;
        const request_sender = req.params.request_sender;
        Friends.findOne({request_sender:request_sender, request_getter:request_getter},function(err,doc){
            if(!doc){
                return res.sendStatus(404);
            }else{
                doc.added=true;
                doc.save();
                return res.sendStatus(200);
            }
        });
    }catch (err){
        return res.send(err);
    }
});

router.delete('/request_sender/:request_sender/request_getter/:request_getter',(req,res)=>{
    try{ 
        const request_getter = req.params.request_getter;
        const request_sender = req.params.request_sender;
        var found = false;
        Friends.findOne({request_sender:request_sender, request_getter:request_getter},function(err,doc){
            if(doc){
                found = true;
                doc.remove();
                doc.save();
            }
        });
        Friends.findOne({request_sender:request_getter, request_getter:request_sender},function(err,doc){
            if(!doc&&!found){
                return res.sendStatus(404);
            }else if(doc){
                doc.remove();
                doc.save();
                return res.sendStatus(200);
            }else if(found){
                return res.sendStatus(200);
            }
        });
        
    }catch (err){
        return res.send(err);
    }
});

router.get('/:user',(req,res)=>{
    try{
        const user = req.params.user;
        var users = [];
        Friends.find({request_sender:user,added:true},function(err,doc){
            if(doc.length){
                users.push(doc);
                console.log(doc)
            } 
            Friends.find({request_getter:user,added:true},function(err,doc){
                if(doc.length){
                    users.push(doc);
                    console.log(doc)
                }
                if(!users.length){
                    return res.sendStatus(404);
                }
                return res.json(200,users);
            });
        });
    }catch (err){
        return res.send(err);
    }
});

router.get('/requests/:user',(req,res)=>{
    try{
        const user = req.params.user;
        Friends.find({request_getter:user,added:false},function(err,doc){
            if(!doc.length){
                return res.sendStatus(404);
            }
            
            return res.json(200,doc);
        });
    }catch (err){
        return res.send(err);
    }
});

module.exports = router;