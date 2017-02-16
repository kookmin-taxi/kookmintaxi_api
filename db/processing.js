/**
 * Created by codertimo on 2017. 2. 16..
 */
var User = require('./user');
var Room = require('./room');
var Access_Token = require('./access_token');
var randtoken = require('rand-token');


Array.prototype.contains = function ( needle ) {
    for (i in this) {
        if (this[i] == needle) return true;
    }
    return false;
};

/**
 * accessToken을 생성하는 DB헨들러
 * 생성하기 위해서 user_id를 인자로 넘겨줌
 * @param user_id
 * @param callback
 */
function db_accessToken_make(user_id, callback)
{

    var rand_string = randtoken.generate(16);

    Access_Token.findOne({user_id : user_id}, function(err, access_token){
        if(!access_token)
        {
            var token = new Access_Token();
            token.access_token = rand_string;
            token.user_id = user_id;

            token.save(function(err){
                if(err) return callback(new Error("Token Make and Save Error"), null);
                return callback(null, rand_string);
            });
        }
        else
        {
            access_token.access_token = rand_string;
            access_token.save(function(err)
            {
                if(err)
                    return callback(new Error("Token Make and Update Error",null));
                return callback(null, rand_string);
            });
        }
    });


}

/**
 * accessToken을 Expired 시키는 DB Handler
 * accessToken을 넣으면 자동으로 Expired됨
 * @param access_token
 * @param callback
 */
function db_accessToken_delete(access_token, callback)
{
    Log.remove({access_token : access_token},function (err) {
        if(err)
            return callback(new Error("Token Delete Error"));
        return callback(null);
    });
}

/**
 * accessToken이 유효한지 아닌지 확인하는 DB핸들러
 * callback으로 True False값을 넘겨줌
 * @param access_token
 * @param callback
 */
function db_accessToken_auth(access_token,callback)
{
    Access_Token.findOne({access_token:access_token},function (err, result) {
        if(err) {return callback(new Error("Access Token auth Error"),false);}
        if(result==null) {return callback(null, false);}
        return callback(null, true);
    });
}

/**
 * accessToken을 이용해서 유저의 오브젝트를 넘겨주는 DB Handler
 * @param access_token
 * @param callback
 */
function db_accessToken_getUser(access_token, callback)
{
    db_accessToken_auth(access_token,function(err,permission)
    {
        if(err){ return callback(err,null);}
        if(!permission) {return callback(new Error("No Permission"), null);}
        Access_Token.findOne({access_token:access_token},function(err, access_token_object)
        {
            if(err)
                return callback(new Error("db_accessToken_getUser Error"),null);
            User.findOne({id:access_token_object.user_id},function(err, user)
            {
                if(err) {return callback(new Error("db_accessToken_getUser in UserFind Error"),null);}
                if(user==null) {return callback(new Error("db_accessToken_getUser in UserFind No User Object"),null);}
                return callback(null, user);
            });
        });
    });
}

function db_user_history(access_id, callback)
{
    db_accessToken_getUser(access_id, function (err, user) {
        if(err) return callback(err,null);

        var data = [];
        for(var id in user.history)
        {
            Room.findOne({id:id},function (err, room) {
                data.push(room);
                // console.log(room);
            });
        }
        return callback(null,data);
    });
}

/**
 * school_id를 기반으로 user_id를 조회하는 코드이다
 * return user_id
 * @param school_id
 * @param callback
 */

function db_user_findId(school_id, callback)
{
    User.findOne({school_id:school_id},function (err,result) {
        if(err) {return callback(new Error("User Find Error"), null);}
        if(result==null){return callback(new Error("No User"),null);}
        else{return callback(null, result.id);}
    });
}


/**
 * 새로운 유저를 생성하는 DB핸들러
 * Return user_id
 * @param school_id
 * @param name
 * @param grade
 * @param phone
 * @param gender
 * @param callback
 */
function db_user_newUser(school_id,name,grade,phone,gender, callback)
{
    User.findOne({school_id:school_id},function (err, user_temp) {
        if(err) {return callback(err, null);}
        if(user_temp!=null) {return callback(new Error("Exist User"), null);}

        var user = new User();
        var random_string = randtoken.generate(16);
        user.id = random_string;
        user.name = name;
        user.school_id = school_id;
        user.grade = grade;
        user.phone = phone;
        user.gender = gender;
        user.current_room = null;
        user.history = [];
        user.banlist =[];

        /**
         * 계정등록이후에 accessToken 발급 가능하게 user_id 넘겨줌
         */
        user.save(function(err)
        {
            if(err)
                return callback(new Error("User Create Error"),null);

            return callback(null, random_string);
        });
    });
}

/**
 * 탐색하기를 눌렀을 때 조건에 맞는 방이 있는지 없는지 검토후
 * 방이 없으면 db_room_newRoom를 통해서 방을 만든다
 * 이때 방에 필요한 방의 정보들은 아래 파라미터와 같다
 * Return None
 * @param access_id
 * @param destination
 * @param departure
 * @param departure_time
 * @param gender
 * @param max_person
 * @param callback
 */
function db_room_newRoom(access_id, room_info,callback){

    db_accessToken_getUser(access_id, function(err,user)
    {
        if(err)
            return callback(err);

        var room_id = randtoken.generate(16);
        var room = new Room();

        room.id =  room_id;
        room.users = [user];
        room.desination = room_info.destination;
        room.departure_time = room_info.departure_time;
        room.departure = room_info.departure;
        room.gender = room_info.gender;
        room.max_person = room_info.max_person;
        room.creat_time = new Date();
        room.request_stop_activated = false;
        room.stop_request_count = 0;
        room.done = false;
        room.done_time = null;

        room.save(function (err){
        if(err) return callback(new Error("db_room_newRoom room save"));
        //사용자가 속해있는 현재 룸 id를 반영한다
        user.current_room = room_id;
        user.save(function(err)
        {
            if(err)
                return callback(new Error("db_room_newRoom user currentRoom update"));

            return callback(null);
        });
    });

    });
}

/**
 * 룸을 찾는 필터링 알고리즘
 * return 찾으면 room_id, 못찾으면 null
 * @param access_id
 * @param room_info
 * @param callback
 */
function db_room_flitering(access_id, room_info, callback) {
    /**
     * 조건
     * 1. 도착지와 출발지가 동일해야 한다
     * 2. 두명의 출발시간이 5분이내의 차이여야 한다
     */

    db_accessToken_getUser(access_id, function (err, user) {
        if (err != null)
            return callback(err, null);

        if (user == null)
            return callback(new Error("db_accessToken_getUser no user"));

        if(user.current_room != null)
            return callback(new Error("Already In room"));

        var gender = user.gender;

        Room.find({}, function (err, result) {

            if (err != null)
                return callback(new Error("db_accessToken_getUser Room find error"), null);

            result.forEach(function(room)
            {
                var notdone = !room.done;
                var ban_boolean = !(user.banlist.contains(room.id));
                var max_people_condition = room.max_person > room.users.length && room.max_person <= room_info.max_person;
                var place_condition = room.destination == room_info.destination && room.departure == room_info.departure;
                var time_condition = Math.abs(room.departure_time.getTime() - room_info.departure_time.getTime()) < 5 * 60 * 1000;
                var gender_condition = room.gender == "None" || room.gender == gender;

                if (notdone && ban_boolean && place_condition && time_condition && gender_condition && max_people_condition) {
                    return callback(null, room.id);
                }
            });

            return callback(null, null);
        });
    });
}



/**
 * access_id 와 room_id를 이용해서 해당되는 룸에 참가함
 * Return None
 * @param access_id
 * @param room_id
 */
function db_room_join(access_id, room_id, callback)
{
    db_accessToken_getUser(access_id, function(err, user)
    {
        if(err)  { return callback(new Error("db_room_join find get user error")); }
        Room.findOne({id : room_id}, function(err, room)
        {
            room.users.push(user);
            user.current_room = room_id;
            /**
             * 정원이 다 찼을때 자동으로 방을 마감한다.
             */
            if(room.users.length == room.max_person)
            {
                room.save(function(err)
                {
                    if(err) return callback("db_room_join room save error");

                    user.save(function (err) {
                        if(err) return callback(new Error("db_room_join user save error"));

                        db_room_done(room_id,function (err) {
                            if(err) return callback(err);
                            return callback(null);
                        });
                    });
                });
            }
            else
            {
                room.save(function(err)
                {
                    if(err)
                        return callback("db_room_join room save error");

                    user.save(function(err){
                        if(err) return callback(err);

                        return callback(null);
                    });
                });
            }


        });
    });
}

/**
 * GET으로 클라이언트에서 실시간으로 내 룸이 어떤 상황인지 조회 가능한 함수
 * Return Room user list
* @param access_id
*/

function db_room_view(access_id)
{
    db_accessToken_getUser(access_id,function(err, user)
    {
        if(err)
            return callback(err);

        var room_id = user.current_room;

        if(room_id==null)
            return callback(new Error("No room"),null);

        Room.findOne({id:room_id},function(err, room)
        {
            if(err)
                return callback(new Error("db_room_view findRoom error"),null);

            return callback(null,room.users);
        });
    });
}


/**
 * 예약 취소를 눌렀을때 DB handler
 * return null
 * @param access_id
 */
function db_room_out(access_id, callback)
{
    db_accessToken_getUser(access_id, function (err,user) {
        if(err) return callback(err);

        var room_id = user.current_room;

        if(room_id==null)
            return callback(new Error("db_room_out No Room In"));

        Room.findOne({id:room_id},function (err, room)
        {
            if(err)
                return callback(new Error("db_room_out"));

            if(room==null)
                return callback(new Error("No such room"));

            if(room.done)
                return callback(new Error("Already Done"));

            var temp_array = room.users;
            var base_array = [];

            temp_array.forEach(function (item)
            {
                if(item.id != user.id)
                {
                    base_array.push(item);
                }
            });

            user.current_room = null;
            room.users = base_array;

            if(room.users.length == 0)
            {
                Room.remove({id:room_id},function (err)
                {
                    if(err)
                        return callback(new Error("db_room_out room delete error"));

                    user.save(function (err) {
                        if(err)
                            return callback(new Error("db_room_out user update"));

                        return callback(null);
                    });

                });
            }
            else
            {
                user.banlist.push(room_id);

                room.save(function (err) {
                    if(err)
                        return callback(new Error("db_room_out room update"));

                    user.save(function (err) {
                        if(err)
                            return callback(new Error("db_room_out user update"));

                        return callback(null);
                    });

                });
            }
        });

    })
}

/**
 * db_room_stopRequest
 * 에약 취소시에 Request 처리하는 방법
 * return none
 * @param access_id
 * @param callback
 */
function db_room_stopRequest(access_id,callback){
    db_accessToken_getUser(access_id, function (err, user) {
        if(user.current_room==null)
            return callback(new Error("Not In room"));
        Room.findOne({id:user.current_room}, function(err, room)
        {
            if(err) return callback(new Error("db_room_stopRequest Error"));
            if(room.done) return callback(new Error("Already Done"));

            if(!room.request_stop_activated){ room.request_stop_activated = true; }
            room.stop_request_count++;

            if(room.stop_request_count == room.users.length){
                room.save(function(err){
                    if(err) return callback(new Error("db_room_stopRequest Error"));
                    db_room_done(user.current_room, function (err)
                    {
                        if(err) return callback(err);
                        return callback(null);
                    });
                });

            }
            else {
                room.save(function(err){
                    if(err) return callback(new Error("db_room_stopRequest Error"));
                    return callback(null);
                });
            };
        });
    });
}


/**
 *
 * 조회해야 하는 정보
 1. 유저들 정보
 2. 현재 탐승 count
 3. activation_유무
 4. activation_count
 5. done 유무

 return none

 * @param access_token
 * @param callback
 */

function db_room_info(access_token, callback) {

    db_accessToken_getUser(access_token, function (err,user) {
        if(err) {return callback(err,null);}
        if(user.current_room == null) {return callback(new Error("Not in Room"));}
        
       Room.findOne({id:user.current_room},function (err,room) {
            if(err)
                return callback(new Error("db_room_info findRoom Error"),null);
           var users = [];
           
           room.users.forEach(function (item) {
               var user_info = {
                   name:item.name,
                   gender:item.gender,
                   phone:item.phone,
                   grade:item.grade
               } ;
               users.push(user_info);
           });

           var users_count = room.users.length;
           var activation = room.request_stop_activated;
           var activation_count = room.stop_request_count;
           var done_boolean = room.done;
           
           var output = {
               users : users,
               users_count : users_count,
               activation : activation,
               activation_count : activation_count,
               done : done_boolean
           };
           return callback(null, output);
       });
    });
}

/**
 * 모두가 차거나 마감한 방을 닫는 함수
 * return none
 * @param room_id
 * @param callback
 */
function db_room_done(room_id, callback) {
    Room.findOne({id:room_id},function (err,room) {
        if(err) {return callback(new Error("db_room_done findRoom Error"));}
        if(room==null) {return callback(new Error("db_room_done No Room"));}

        //1. 일단 Room을 done
        room.done = true;
        //2. Room done_time 지정
        room.done_time = new Date();
        //3. 각 유저들에게 history 부여
        //4. 각 유저들에게 current_room 비워주기
        room.users.forEach(function (item) {
            item.current_room = null;
            User.findOne({id:item.id},function(err,user)
            {
                if(err) return callback(new Error("db_room_done user find error"));
                user.history.push(room_id);
                user.current_room = null;
                
                user.save(function (err) {
                   if(err) return callback(new Error("db_room_done user save error"));
                });
            });
        });

        //5. 룸 저장
        room.save(function (err) {
            if(err) return callback(new Error("db_room_done Room save Error"));
            return callback(null);
        });

    })
}

module.exports.db_user_newUser = db_user_newUser;
module.exports.db_user_findId = db_user_findId;
module.exports.db_user_history = db_user_history;

module.exports.db_accessToken_make = db_accessToken_make;
module.exports.db_accessToken_delete= db_accessToken_delete;
module.exports.db_accessToken_auth =db_accessToken_auth;
module.exports.db_accessToken_getUser = db_accessToken_getUser;

module.exports.db_room_newRoom = db_room_newRoom
module.exports.db_room_view = db_room_view;
module.exports.db_room_flitering = db_room_flitering;
module.exports.db_room_stopRequest = db_room_stopRequest;
module.exports.db_room_out = db_room_out;
module.exports.db_room_join = db_room_join;
module.exports.db_room_info = db_room_info;
module.exports.db_room_done = db_room_done;
