/**
 * Created by codertimo on 2017. 2. 16..
 */
var request = require('request');
var htmlparser = require('htmlparser');
var db = require('../db/processing');

/**
 * 국민대학교 서버에 로그인을 하는 기능의 함수입니다
 * callback애 성공하면 true / 실패하면 false
 * @param id
 * @param pw
 * @param callback
 */
function kookmin_auth(id, pw, callback)
{
    request.post(
        {
            url:'http://ktis.kookmin.ac.kr/kmu/com.Login.do?',
            form: {
                txt_user_id:id,
                txt_passwd:pw,
                x:1,
                y:1
            }
        },
        function(err,httpResponse,body)
        {
            if(err!=null){return callback(err,400);}
            else
            {
                var handler = new htmlparser.DefaultHandler(function (error, dom) {
                    if (error) {return callback(err,400);}
                    else{
                        /**
                         * 로그인 성공조건 dom에 있는 리스트의 엘리먼트가 3개 이상이어야 한다
                         * 만약 엘리먼트가 2개 이하면, 로그인 실패로 간주한다
                         */
                        if(dom.length > 2)
                        {
                            console.log("Login Success");
                            return callback(null,true);
                        }
                        else
                        {
                            console.log("Login Failed");
                            return callback(null,false);
                        }
                    }
                });
                var parser = new htmlparser.Parser(handler);
                parser.parseComplete(body);
            }
        }
    );
}


/**
 * 회원 아이디와 패스워드를 기반으로 access_token을 발급합니다
 * @param id
 * @param pw
 * @param callback
 */
function login(id, pw, callback){
    kookmin_auth(id, pw, function (err, success) {
        if(!success) return callback(err, null);
        db.db_user_findId(id, function(err, user_id)
        {
           if(err!=null) return callback(err, null);
            db.db_accessToken_make(user_id, function(err, access_token)
            {
               if(err!=null) return callback(err, null);
                return callback(null, access_token);
            });
        });
    })
}


/**
 * 회원가입을 하는 함수입니다
 * 회원가입에 성공하면 access_token을 보내고, 실패하면 null값이 callback에 전달됩니다
 * @param id
 * @param name
 * @param phone
 * @param gender
 * @param grade
 * @param callback
 */
function register(id, name, phone, gender, grade, callback)
{
    db.db_user_newUser(id, name, grade, phone, gender, function(err, user_id){
        if(err!=null) return callback(err,null);
        
        db.db_accessToken_make(user_id,function (err, access_token) {
            if(err!=null) return callback(err,null);
            return callback(null,access_token);
        });
    });
}

module.exports.kookmin_auth = kookmin_auth;
module.exports.register = register;
module.exports.login = login;



