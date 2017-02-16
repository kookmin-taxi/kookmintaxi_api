/**
 * Created by codertimo on 2017. 2. 15..
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var access_token_schema = new Schema({
    access_token:String,
    user_id:String
});

module.exports = mongoose.model('access_token', access_token_schema);
