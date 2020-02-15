const cache = require('../middlewares/cache-middleware');
const express = require('express');
const router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mc = require('mongoose');
var conn = mc.connection;
const Pictures = require('../models/Pictures');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const request = require('request');
const cookieParser = require('cookie-parser');



function checkusername(username,res){
    if(username==null){
        return res.status(401).send("Unauthorized");
    }
}

router.post('/username/:user',cache.get,cache.set,(req,res)=>{
    try{
        const username = req.params.user;
        checkusername(username,res);
        request('https://www.instagram.com/'+username+'/?__a=1',(error,response,body)=>{
            if(!error&&response.statusCode==200){
                body = JSON.parse(body)
                var places = [];
                Pictures.find({user:username},(err,doc)=>{
                    if(doc.length){
                        return res.send(409);
                    }else{
                        body.graphql.user.edge_owner_to_timeline_media.edges.forEach(element => {
                            if(element.node.location!=null){
                                const picture = new Pictures({
                                    location:element.node.location.name,
                                    url:element.node.display_url,
                                    user:username
                                });
                                places.push(picture);
                                picture.save();
                            }
                        });
                        if(places==[]){
                            return res.sendStatus(404);
                        }else{
                            return res.sendStatus(201);
                        }
                    }
                });
            }else{
                return res.sendStatus(response.statusCode);
            }
        });
    }catch(err){
        return res.send(err);
    }
});

router.put('/username/:user',cache.get,cache.set,(req,res)=>{
    try{
        const username = req.params.user;
        checkusername(username,res);
        var contains=false;
        request('https://www.instagram.com/'+username+'/?__a=1',(error,response,body)=>{
            if(!error&&response.statusCode==200){
                body = JSON.parse(body)
                var places = [];
                body.graphql.user.edge_owner_to_timeline_media.edges.forEach(element => {
                    if(element.node.location!=null){
                        Pictures.findOne({url:element.node.display_url},function(err,doc){
                            if(!doc){
                                const picture = new Pictures({
                                    location:element.node.location.name,
                                    url:element.node.display_url,
                                    user:username
                                });
                                places.push(picture);
                                picture.save();
                            }  
                        });
                    }
                });
                if(!places.length){
                    return res.sendStatus(409);
                }
                return res.sendStatus(200);
            }else{
                return res.sendStatus(response.statusCode);
            }
        });
    }catch (err){
        return res.send(err);
    }
});

router.get('/username/:user',cache.get,cache.set,async(req,res)=>{
    try{
        const username = req.params.user;
        const pictures = await Pictures.find({user:username});
        if(!pictures.length){
            return res.sendStatus(404);
        }
        return res.json(200,pictures);
    }catch (err){
        return res.json(err);
    }
});

router.get('/username/:user/location/:location',cache.get,cache.set,async(req,res)=>{
    try{
        const location = req.params.location.toString();
        const username = req.params.user;
        const pictures = await Pictures.find({location:location,user:username});
        if(!pictures.length){
            return res.sendStatus(404);
        }
        return res.json(200,pictures);
    }catch (err){
        return res.json(err);
    }
});

router.get('/:id',cache.get,cache.set,async(req,res)=>{
    try{
        const objID = req.params.id.toString();
        const picture = await Pictures.find({_id:objID.toObjectId()});
        if(!picture.length){
            return res.sendStatus(404);
        }
        return res.json(200,picture);
    }catch (err){
        return res.json(err);
    }
});

router.delete('/username/:user',async(req,res)=>{
    try{
        const username = req.params.user;
        await Pictures.deleteMany({user:username},function(err,doc){
            if(!doc.deletedCount){
                return res.sendStatus(404);
            }else{
                return res.sendStatus(200);
            }
        });
    }catch (err){
        return res.send(err);
    }
});

router.delete('/username/:user/location/:location',async(req,res)=>{
    try{
        const location = req.params.location;
        const username = req.params.user;
        await Pictures.deleteMany({location:location,user:username},function(err,doc){
            if(!doc.deletedCount){
                return res.sendStatus(404);
            }else{
                return res.sendStatus(200);
            }
        });
    }catch (err){
        return res.send(err);
    }
});

router.delete('/:id',async(req,res)=>{
    try{
        const objID = req.params.id;
        await Pictures.findOne({_id:objID.toObjectId()},(err,doc)=>{
            if(!doc){
                return res.sendStatus(404);
            }else{
                doc.remove();
                doc.save();
                return res.sendStatus(200);
            } 
        });
    }catch (err){
        return res.send(err);
    }
});


module.exports = router;