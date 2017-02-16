/**
 * Created by codertimo on 2017. 2. 15..
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user_schema = new Schema({
    id:String,
    school_id:String,
    name:String,
    grade:Number,
    phone:String,
    gender:String,
    current_room:String,
    history:[String],
    banlist:[String]
});




module.exports = mongoose.model('user', user_schema);
