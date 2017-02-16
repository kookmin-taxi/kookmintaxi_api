/**
 * Created by codertimo on 2017. 2. 16..
 */
var express = require('express');
var router = express.Router();
var room_hander = require('../../handler/room_handler');


/* GET home page. */
router.post('/join', function(req, res)
{
    room_hander.join_room(req.body.access_token, req.body.desination, req.body.departure,
        new Date(req.body.departure_time),  req.body.gender, req.body.max_person, function (err) {
        if(err) {
            res.json({status: false, error: err.message});
        }
        else{
            res.json({status : true});
        }
        }
    );
});

router.post('/out', function(req, res){
   room_hander.out_room(req.body.access_token, function(err)
   {
      if(err){
          res.json({status:false, error : err.message});
      }
       else {
         res.json({status:true});
      }

   }); 
});

router.post('/view', function(req, res)
{
    room_hander.view_room(req.body.access_token, function(err, output)
    {
       if(err) {
           res.json({status:false, error : err.message});
       }
        else{
           res.json({status:true, room_info:output});
       }
    });
});

router.post('/stop_request',function (req,res) {
   room_hander.stopRequest_room(req.body.access_token, function (err) {
      if(err){
          res.json({status:false, error:err.message});
      }
      else
      {
          res.json({status:true});
      }
   });
});



module.exports = router;

