/**
 * Created by codertimo on 2017. 2. 17..
 */
var express = require('express');
var router = express.Router();
var user_handler = require('../../handler/user_handler');

router.post('/history',function (req, res) {
   user_handler.user_history(req.body.access_token,function (err, history) {
       if(err) {res.json({status:false, error :err.message});}
       else {
           res.json({status:true, history:history});
       }
   });
});

module.exports = router;