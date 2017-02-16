/**
 * Created by codertimo on 2017. 2. 15..
 */
/*
    택시 찾기를 위한 Room 스키마입니다
    [String] id : Room Id
    [Date]   departure_time : 출발시간
    [String] destination : 목적지
    [String] departure : 출발지
    [String] gender : 같이 탈수있는 성별 (male, female, none)
    [Int]    max_person : 최대탑승 가능 인원
    [User List] users : 탑승인원들

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

var room_schema = new Schema({
    id:String,
    destination:String,
    departure_time:Date,
    departure:String,
    gender:String,
    max_person:Number,
    users:[user_schema],
    creat_time:Date,
    request_stop_activated:Boolean,
    stop_request_count:Number,
    done:Boolean,
    done_time:Date
});

module.exports = mongoose.model('room', room_schema);
