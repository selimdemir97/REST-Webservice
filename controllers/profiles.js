const Profile = require('../models/profile');
const mongoose = require('mongoose');
const User = require('../models/user');
const request = require('request');

module.exports = {
    createProfile: async (req, res, next) => {
        try{
            const token = req.params.id;
            const profileName = req.params.name;
            const profile = new Profile;
                    request('https://www.instagram.com/'+profileName+'/?__a=1', async(error,response,body2)=>{
                        if(!error&&response.statusCode==200){
                            console.log(response);
                            body2 = JSON.parse(body2);
                            await Profile.findOne({insta_profile: profileName},(err,doc)=>{
                                if(!doc){
                                    profile.insta_profile = profileName; 
                                    profile.user_id = token; 
                                    profile.biography=body2.graphql.user.biography,
                                    profile.profile_pic_url=body2.graphql.user.profile_pic_url,
                                    profile.followedby=body2.graphql.user.edge_followed_by.count,
                                    profile.follwos=body2.graphql.user.edge_follow.count,
                                    profile.full_name=body2.graphql.user.full_name
                                    profile.save();
                                    return res.sendStatus(201);
                                }else{
                                    return res.sendStatus(409);
                                }
                            });
                        }else{
                            return res.sendStatus(response.statusCode);
                        }   
                    });
        }catch(err){
            console.log(err)
            return res.send(err);
        }

    },

    updateProfile: async (req, res, next) => {
        try{
            const id = req.params.id;
            Profile.findOne({user_id:id},function(error,document){
                if(!document){
                    return res.send(404);
                }else{
                    var profileName=document.insta_profile;
                    request('https://www.instagram.com/'+profileName+'/?__a=1', async(error,response,body2)=>{
                        if(!error&&response.statusCode==200){
                            body2 = JSON.parse(body2);
                            Profile.findOne({insta_profile: profileName},(err,doc)=>{
                                if(doc){
                                    doc.biography=body2.graphql.user.biography;
                                    doc.profile_pic_url=body2.graphql.user.profile_pic_url;
                                    doc.followedby=body2.graphql.user.edge_followed_by.count;
                                    doc.follwos=body2.graphql.user.edge_follow.count;
                                    doc.full_name=body2.graphql.user.full_name;
                                    doc.save();
                                    return res.sendStatus(200);
                                }else{
                                    return res.sendStatus(404); 
                                }
                            });  
                    }else{
                        return res.sendStatus(response.statusCode);
                    }
                });
            }
        });
        }catch(err){
            console.log(err)
            return res.send(err);
        }

    },

    getProfile: async (req, res, next) => {
        try {
            const token = req.params.token;
            const profile = await Profile.findOne({user_id: token});
            console.log(profile);
            if(profile != null){   
                res.json(200,profile);
            }
        } catch (err) {
            return res.json(err);
        }    
    },

    getForeignProfile: async (req, res, next) => {
        try {
            const user = req.params.user;
            const profile = await Profile.findOne({insta_profile: user});
            console.log(profile);
            if(profile != null){   
                res.json(200,profile);
            }
        } catch (err) {
            return res.json(err);
        }    
    },

    deleteProfile: async (req, res, next) => {
        console.log("Apfel: ");
        try{
            const id = req.params.id;
            await Profile.findOne({user_id : id}, function(err, doc){

                doc.remove();
                doc.save();
                return res.sendStatus(200);
            });
        }catch (err){
            return res.json(err);
        }
    } 
}