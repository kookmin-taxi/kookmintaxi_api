/**
* Created by codertimo on 2017. 2. 15..
*/
var express = require('express');
var router = express.Router();
var db = require('../../db/processing');
var auth = require('../../handler/auth_handler');


/* GET home page. */
router.post('/login', function(req, res)
{
    if(req.body.id==undefined || req.body.pw == undefined)
        res.json({status : false , error:"Undefined id password"});

    else{
        auth.login(req.body.id,req.body.pw,
            function (err, access_token)
            {
                if(err!=null){res.json({status:false, error:err.message});}
                else{
                    if(!access_token) res.json({status : false, error:"Login Failed"});
                    else res.json({status: true, access_token : access_token});
                }
            });
    }
});


/* GET home page. */
router.post('/auth', function(req, res)
{
    if(req.body.id==undefined || req.body.pw == undefined)
        res.json({status : false, error:"Undefined id password"});
        
    else{
        auth.kookmin_auth(req.body.id,req.body.pw,
            function (err, success)
            {
                if(err!=null) res.json({status:false, error:err});
                else{
                    if(!success) res.json({status:false, error:"Login Failed"});
                    else
                    {
                        res.json({status:true});
                    }
                }
            });
    }
});


router.post('/register', function (req, res) {

auth.register(req.body.id, req.body.name, req.body.phone, req.body.gender, req.body.grade,
        function(err,access_token) {
        if(err!=null) res.json({status:false, error:err.message});
        else if(!access_token) {res.json({status : false, access_token:null});}
        else {res.json({status:true, access_token :access_token});}
    });
});


module.exports = router;

