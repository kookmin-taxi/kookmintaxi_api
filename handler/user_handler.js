/**
 * Created by codertimo on 2017. 2. 17..
 */
var db = require('../db/processing');

function user_history(access_token,callback){
    db.db_user_history(access_token, function (err, history) {
        if(err) return callback(err, history);
       return callback(null, history); 
    });
}

module.exports.user_history = user_history;
