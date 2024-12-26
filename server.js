const express = require("express"); // express 라이브러리를 사용하기 위한 변수
const app = express();

//mongodb 라이브러리 사용하기 위한 코드
// ObjectId함수를 사용하기 위해선 ObjectId를 추가
const { MongoClient, ObjectId } = require("mongodb");

//methodOverride라이브러리를 사용하기 위한 코드 작성
const methodOverride = require('method-override')


// 비밀번호 해싱 bcrypt
const bcrypt = require('bcrypt');


// 로그인 한 세션을 DB에 저장하기 위한 라이브러리
const MongoStore = require('connect-mongo')

// 환경변수를 다른파일에 보관하기 위한 코드
require('dotenv').config()



// html 파일에 데이터를 넣고 싶으면 .ejs 파일로 만들면 가능.
app.set("view engine", "ejs");
// 요청.body 사용할려면 필수
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));



// passport 라이브러리를 사용할 때 필요한 코드
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

//순서 잘 지켜야 됨
app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  //secret은 세션의 id는 암호화해서 유저에게 보내기 때문에 secret이 털리면 개인정보가 다 날라간다.
  resave : false,
  // 유저가 서버로 요청할 때 마다 세션을 갱신할 것인지  보통은 false로 한다.
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000 }, // 1시간이 지나면 자동으로 세션종료 해준다.
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : 'forum'
  })
   
}))

app.use(passport.session()) 


// /list로 api요청시 현재 시간을 터미널에 출력하기
app.use('/list', (요청,응답,next) => {
  console.log(new Date());
  next();
})


const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.S3_KEy,
      secretAccessKey : process.env.S3_SECRET
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'jaeshinforum1',
    key: function (요청, file, cb) {
      cb(null, Date.now().toString()) //업로드시 파일명 변경가능
    }
  })
})






let db;
const url = process.env.DB_URL;
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(process.env.PORT, () => {
      console.log("http://localhost:8081 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// server.js에서 css파일을 사용하기 위한 코드
// .css .js .jpg 파일들은 static파일 이라고 한다.
app.use(express.static(__dirname + "/public"));

// 누가 /shop으로 접속하면 '쇼핑페이지입니다.'를 보여준다.
app.get("/shop", (요청, 응답) => {
  응답.send("쇼핑페이지 입니다.");
});

//function은 함수 문법
//콜백함수(다른함수 파라미터에 들어가는 함수)

//유저에게 html파일을 보내주려면
app.get("/", (요청, 응답) => {
  if(!요청.user){
    응답.send('로그인 부터 하세요~')
  }else if(요청.user){
    응답.sendFile(__dirname + "/index.html");
  }
  // __dirname은 절대경로 server.js가 담긴 폴더를 의미하는 것
  // /index.html 파일과 server.js 파일이 같은 폴더에 있기 때문에 index.html파일을 보내줄 수 있다.
});

// 누가 /news로 접속하면 DB에 무엇인가를 저장해보자
app.get("/news", (요청, 응답) => {
  // 누군가 /news로 접속하면 오늘의뉴스!를 보여준다.
  db.collection("post").insertOne({ title: "어쩌구" });
  //응답.send('오늘의 뉴스!');
});

// 2024-12-06

// db.collection('post').find().toArray()
// await 문법을 사용하기 위해 (요청,응답) 앞에 aysnc를 붙여야 사용할 수 있음
app.get("/list", async (요청, 응답) => {
  //result 변수에  await db.collection('post').find().toArray() 저장
  // MongoDB에 있는 데이터들을 불러올 때  post 라는 collection 뒤에 .find().toArray()를 사용하여 불러올 수 있다.
  // await
  let result1 = await db.collection("post").find().toArray();
  응답.render("list.ejs", { posts: result1 });
});

// html 파일에 서버 데이터를 넣는 방법은 template engine을 사용하면 된다.
// template engine인 ejs를 사용하면 html파일에 서버 데이터를 넣을 수 있다.
// ejs 파일은 views폴더안에 만든다.
// 유저에게 보낼 때 응답.send가 아닌 응답.render를 사용하여 데이터를 유저에게 보낼 수 있다.
// 예제 코드
// list.ejs는 ejs파일명 ejs파일은 views폴더에 넣어 관리한다.
//             posts는 html에서 보여줄 데이터명이다.
//                    result는 서버 데이터들이 들어있는 변수이다.
// 응답.render('list.ejs", {posts : result})
// html에서  <%= posts %>를 사용하여 데이터를 가져올 수 있다.

let now = new Date();

// 오늘 숙제
app.get("/time", (요청, 응답) => {
  응답.render("time.ejs", { 지금시간: now });
});

/* 2024-12-09 

1.method종류 : GET, POST, PUT, UPDATE, DELETE
Get : 서버에 데이터를 요청할 때
post : 서버에 데이터 입력요청할 때
put : 서버에 데이터 수정을 요청할 때
delete : 서버에 데이터를 삭제 요청할 때


2.url : /list 여기서 url은 EndPoint라고도 한다.


3. REST API
  



*/

/* 
      2024-12-09 chapter1

      <%는  html 사이에 자바스크립트 문법을 쓸 때 사용한다 %>
      예제 
      <div class="white-bg">
         <% for(let i = 0; i < posts.length; i++){ %>

          여기서 for(let i = 0; i < posts.length; i++) 자바스크립트 문법이기 때문에
          문법이 시작하는 for() 앞에 <% 사용하고 문법이 끝나는 곳 { 뒤에 %>를 해주면 
          html 파일에서 자바스크립트 문법을 사용할 수 있다.
          
          JSP랑 비슷하다고 보면 된다.

          <div class="list-box">
            <h4><%= posts[i].title %></h4>
            <p><%= posts[i].contents %></p>
          </div>
         <% } %>
        </div> 


        <%- :  include같은 문법을  쓸 때 사용한다. %>
    
      */

/*2024-12-09 chapter02




*/

app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});

app.post("/add", upload.single('img'), async (요청, 응답) => {
  console.log(요청.file)
    // 에러상황을 처리하고 싶을 땐 try catch를 사용하면 된다.
  try {
    if (요청.body.title == "") {
      응답.send("제목 입력해라~");
    } else if (요청.body.content == "") {
      응답.send("내용 입력 안했는데?");
    } else {
      // 데이터베이스에 요청한 값을 저장하기 위해서는 insertOne을 사용하면 된다.
      await db
        .collection("post")
        .insertOne({ title: 요청.body.title, contents: 요청.body.content });
      응답.redirect("/list");
    }
  } catch (e) {
    console.log(e);
    응답.status(500).send("서버에러");
  }
});

// 2024-12-11
// 상세페이지 만들기

// url파라미터 문법을 사용하면 비슷한 /url을 가진 api 여러개 만들 필요 없음.

//        url파라미터를 사용하기 위해선 url/에 : 을 넣어주고 :뒤에 아무 글을 작성하면 된다.
//          ex) detail/:id
//          만약에 상품 id를
// 컬렉션에서 하나의 게시물만 불러오고 싶을 경우 findOne 함수를 사용해 불러올 수 있다.
// 이때 ObjectId를 사용하여 불러오는데 ObjectId를 사용하기 위해선 앞에 new를 적어야 가능하다.
app.get("/detail/:id", async (요청, 응답) => {
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) });
  console.log(요청.params.id);
  응답.render("detail.ejs", { detail: result });
});


// 2024.12.12  수정기능 만들기

app.get('/post/:id', async(요청,응답) => {
  let result = await db.collection('post').findOne({_id: new ObjectId(요청.params.id)})
  응답.render('edit.ejs', {edit : result})
})

// 수정 api

//수정기능을 만들기 위해서 updateOne을 사용하면 된다.
// ex) db.collection('post').updateOne({_id: new ObjectId(요청.body.id)}, {$set : {title : 요청.body.title, contents : 요청.body.contents, }})
// 제목과 내용을 수정해야 하기 때문에 데이터베이스에 있는 title,content를 요청.body를 사용하여 데이터베이스로부터 데이터를 가져와야 함


//원래 form태그에는 GET,POST 메서드만 사용 가능하지만 
// method-override라이브러리를 사용하면 form태그에 PUT,DELETE 메서드를 사용할 수 있음
// 사용예제 : action="/edit?_method=PUT" method="POST"
app.put('/edit', async(요청,응답) => {
  try{
  
    if(요청.body.title == ''|| 요청.body.contents == ''){
      응답.send('제목이나 내용에 빈칸이 있으면 안됩니다.')
    }else{
      await db.collection('post').updateOne({_id: new ObjectId(요청.body.id)}, {$set : {title : 요청.body.title, contents : 요청.body.contents, }})
    응답.redirect('/list');
    }
  }catch(e) {
    
    응답.status(500).send("서버에러");
  }
  
})


// 2024-12-13 삭제기능 

app.delete('/delete', async (요청,응답) => {
  await db.collection('post').deleteOne({_id: new ObjectId(요청.query.docid)})
  응답.send('삭제완료!');
})


// pagination 

app.get('/list/:id', async (요청,응답) => {
  let result = await db.collection('post').find().skip((요청.params.id -1) * 5).limit(5).toArray()
  응답.render('list.ejs', {posts : result})
})



// 2024-12-16 
//  세션
/*
npm install express-session passport passport-local 
에서 express-session은 세션을 만들 수 있게 도와주는 라이브러리 
passport는 회원인증을 도와주는 라이브러리 
passport-local은 아이디 비밀번호 방식을 이용한 회원인증할 때 쓰는 라이브러리

*/

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  try{
    let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }
  
  if (await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
  }catch(e){
    console.l('에러~', e);
  }
}))



// 로그인 세션
/*
요청.logIn(user, (err)=> { 을 실행할 때마다 같이 실행된다.

if (result.password == 입력한비번) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }

  이 부분에 있는 result가     user 파라미터로 이동해서 유저 정보를 가져올 수 있음
  passport.serializeUser((user, done) => {
  

*/
passport.serializeUser((user, done) => {
  process.nextTick(() => { // 내부 코드를 비동기적으로 처리해줌
    done(null,{ id: user._id, username : user.username })
  })
})

// passport.deserializeUser()는 쿠키를 분석하는 코드
passport.deserializeUser(async (user, done) => {
  
 let result = await db.collection('user').findOne({_id: new ObjectId(user.id)})
 delete result.password
  process.nextTick(() => {
    done(null, result)
  })
})



app.get('/login', (요청,응답) => {
  응답.render('login.ejs');
})

app.post('/login',idPasswordCheck, (요청,응답,next) => {
  passport.authenticate('local', (error, user,info) => {
    if(error)return 응답.status(500).json(error)
      if(!user) return 응답.status(500).json(info.message)
        요청.logIn(user, (err)=> {
          if(err) return next(err)
            응답.redirect('/list')
        })

  })(요청,응답, next)
  
})






/* 

1. 로그인 성공하면 세션 만들고 쿠키를 유저에게 보내기
(passport.serializeUser()를 사용하면 자동임)
2. 유저가 쿠키 제출시 확인 
(passport.deserializeUser()를 사용하면 자동)
*/


// 가입기능 만들기

// /register 라우터로 get요청시 register.ejs을 보여주기
app.get('/register',idPasswordCheck, (요청,응답) => {
  응답.render('register.ejs')
})


// app.post로 회원가입 한 아이디 비밀번호를 디비에 저장
// hashing 알고리즘
app.post('/register', idPasswordCheck, async (요청,응답) => {

  let 해싱 = await bcrypt.hash(요청.body.password, 10)
  let result = await db.collection('user').findOne({ username : 요청.body.username})
  try{
     if(result){
      응답.send('아이디가 이미 있습니다. 중복은 불가능합니다.');
    }else if(요청.body.password.length < 6){
      응답.send('비밀번호는 6글자 이상입니다.')
    }else {
      await db.collection('user').insertOne({username : 요청.body.username, password : 해싱})
      응답.redirect('/list')
      
    }
     
  }catch(e){
    console.log(e)
  }
  
})


// 2024-12-18 환경변수 / 미들웨어

/* 
환경변수는 별도 파일에 보관하는게 좋다.
환경변수를 보관하는 파일은 .env 

보관 방법은 

변수명 = 넣어줄 중요한 변수 
ex) PORT = 8081 
이렇게 작성해주고 포트번호 가 들어갈 자리에 PORT라는 변수명을 넣어주면 된다. 
가변적인 변수에 사용
env는 github에 올리면 안됨.
*/


// 미들웨어
// app.post('/register', idPasswordCheck, async (요청,응답) => {
// 이런식으로 /register를 요청할 때  idPasswordCheck 미들웨어를 /register와 async (요청,응답) 사이에 넣어주면 
// /register post 요청 후 idPasswordCheck 미들웨어가 실행 된 후   async (요청,응답) => { 이 사이에 있는 코드가 실행이 된다.}
// 미들웨어는 3개의 인자 값을 가진다. 요청,응답,next 
// 미들웨어가 끝난 후 next()를 작성하지 않으면 반복실행?이 된다..
function idPasswordCheck (요청,응답,next) {
  if(요청.body.username == '' || 요청.body.password == ''){
    응답.send('공백은 안됨.');
  }else {
    next()
  }
}

 


// 2024-12-26 검색기능 만들기 
//$regex : 요청.query.val = 정규식
// find({title : "요청.query.val"})을 입력하고 게시글을 검색할 때 title : 이  요청한 제목과 정확히 일치해야만 검색해서 가져올 수 있는데
// find({ title: {$regex : 요청.query.val} }) 이런식으로 $Regex 정규식을 사용하면  요청한 제목이 포함된 게시글을 가져올 수 있다.

// 검색을 좀 더 빠르게 하고 싶으면 index를 사용하면 됨
// Index 단점은 document 추가/수정/삭제시 index도 반영해야 한다.
//$text text index를 사용하겠다는 뜻
// let result = await db.collection('post').find({$text : { $search : 요청.query.val}}).toArray()

//search-index  
app.get('/search', async(요청,응답) => {
  console.log(요청.query.val)
    let 검색조건 = [
      {$search : {
        index : 'title_index',
        text : { query : 요청.query.val, path : 'title' }
      }},
      { $sort : { _id : 1 } },
      { $limit : 10 },
      { $project : { _id : 0 } }
    ] 
 let result = await db.collection('post').aggregate(검색조건).toArray()
  응답.render('search.ejs', { posts : result })
})

