/**
 * Created by codertimo on 2017. 2. 16..
 */
var db = require('../db/processing');
/**
 * 탐색하기 버튼을 눌렀을때 동작하는 함수
 * 만약 나의 조건과 일치하는 룸이 있을 경유 룸에 join
 * 만약 나의 조건과 일치하는 룸이 없을 경우 룸을 create 한다
 * 
 * @param access_token
 * @param destination
 * @param departure
 * @param departure_time
 * @param gender
 * @param max_person
 * @param callback
 */
function join_room(access_token,destination,departure,departure_time,gender,max_person,callback) {
    var room_info = {
        destination : destination,
        departure : departure,
        departure_time : departure_time,
        gender : gender,
        max_person : max_person
    };
    db.db_room_flitering(access_token,room_info, function (err, room_id) {
        if(err!=null)
            return callback(err);
        
        if(room_id!=null)
        {
            db.db_room_join(access_token,room_id, function (err) {
                if(err!=null)
                    return callback(err);
                return callback(null);
            });
        }
        else
        {
            db.db_room_newRoom(access_token,room_info,function(err)
            {
               if(err!=null)
                   return callback(err);
                return callback(null);
            });
        }
    });
}

/**
 * 현재 잡은 방을 나가는 함수이다
 * @param access_token
 * @param callback
 */

function out_room(access_token, callback)
{
    db.db_room_out(access_token, function (err) {
        if(err!=null)
            return callback(err);
        
       return callback(null); 
    });
}


function view_room(access_token, callback)
{
    db.db_room_info(access_token, function (err, output) {
        if(err) return callback(err,null);
        return callback(null, output);
    });
}

function stopRequest_room(access_token,callback)
{
    db.db_room_stopRequest(access_token, function(err){
        if(err){
            return callback(err);
        } 
        else {
            return callback(null);
        }
    });
}

module.exports.join_room = join_room;
module.exports.out_room = out_room;
module.exports.view_room = view_room;
module.exports.stopRequest_room = stopRequest_room;
