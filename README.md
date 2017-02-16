#국민택시 API

##프로세스
1. 최초실행화면
	1. 국민대학생 인증(/auth/auth)
	2. 국민택시 회원가입(/auth/register) -> access_token 발급
2. 기존실행화면
	1. 국민택시 로그인(/auth/login)
3. 메인화면
	1. 탐색하기 버튼 누르기(/room/join)
	2. 5초에 한번씩 데이터 리프레쉬(/room/view)
	3. 탐색 강제종료하기(/room/out) -> 다시 메인화면(1)로 돌아감
	4. 모인 유저에게 마감요청하기(/room/stop_request)
	5. 유저들이 이에 동의하기(/room/stop_request)
	6. 탑승마감(/room/view 의 done value -> true)

##POST /auth/auth
설명 : 국민대학교 시스템을 이용해서 로그인 가능 여부를 알려주는 메소드

Input 

```json
{
	"id":2017****,
	"pw":ad******
}
```

Output 

```json
{
  "status": true
}
```

##POST /auth/register

설명 : 국민택시에 계정을 등록하는 과정

Input 

```json
{
	"id":20163088, //ktis 국민대ID
	"name":kookminTest,
	"gender":"male",
	"phone":"0105068****",
	"grade":3
}

```

Output

```json
{
  "status": true,
  "access_token": "PhxlNenyantZw7Da"
}

```

##POST /auth/login
설명 : 국민택시 로그인 메소드

Input 

```json
{
	"id":2017****,
	"pw":ad******
}
```

Output

```json
{
  "status": true,
  "access_token": "ydo5TOva13ppptcZ"
}

``` 


##POST /room/join

설명 : 탐색하기 버튼을 누를때 호출하는 메소드

Input 

```json
{
	"access_token":7asfh83ha
}
```

Output

```json
{
  "status": true
  //정상적인 큐 등록이 완료되었을 때
}
```

##POST /room/out

설명 : 현재 대기열 및 탐색을 취소하는 버튼을 누를때 호출하는 메소드

Input 

```json
{
	"access_token":7asfh83ha
}
```

Output

```json
{
  "status": true
  //정상적으로 등록이 완료되었을 때
}
```

##POST /room/view
설명 : 현재 탐색중인 상태를 나타내는 메소드(약 5초에 한번씩 호출 권장)

Input

```json
{
	"access_token":7asfh83ha
}
```

Output

```json
{
  "status": true,
  "room_info": {
    "users": [
      {
        "name": "Junseong Kim",
        "gender": "male",
        "phone": "01050682283",
        "grade": 3
      }
    ],
    "users_count": 1,
    "activation": false, //activation은 마감버튼이 눌렸을때
    "activation_count": 0, //activation_count는 투표수(전부 투표하면 done상태)
    "done": false //탑승모집이 마감된경우 true로 변환
  }
}
```

##POST /room/stop_request

설명 : 

1. 지금까지 모인 사용자들에게 이대로 타자고 제안할때, 투표할때 쓰는 api. 
2. 유저중 누군가 맨처음 호출하면 activation이 true로 변함.
3. 유저들이 동의하면 activation_count가 증가함
4. 유저수와 activation_count가 똑같아지면(모두가 동의하면)
5. room이 done상태로 변경된다(done이란 마감이라는 뜻이며, done변수가 true된다.)

Input 

```json
{
	"access_token":7asfh83ha
}
```

Output

```json
{
  "status": true
  //정상적으로 등록이 완료되었을 때
}
```



