var express = require('express');
var router = express.Router();
var db = require('../db/processing');

/* GET home page. */
router.get('/', function(req, res, next)
{
    console.log("asdf");
   res.render("index",{title:"g"});
});

module.exports = router;
