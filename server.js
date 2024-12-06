const express = require('express') // express 라이브러리를 사용하기 위한 변수
const app = express()
// html 파일에 데이터를 넣고 싶으면 .ejs 파일로 만들면 가능.

app.set('view engine', 'ejs')


//mongodb 라이브러리 사용하기 위한 코드
const { MongoClient } = require('mongodb')

let db
const url ='mongodb+srv://shin:153123@cluster0.ydxf4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중');

})
}).catch((err)=>{
  console.log(err)
})


// server.js에서 css파일을 사용하기 위한 코드
// .css .js .jpg 파일들은 static파일 이라고 한다. 
app.use(express.static(__dirname + '/public'))









// 누가 /shop으로 접속하면 '쇼핑페이지입니다.'를 보여준다.
app.get('/shop', (요청,응답) => {
    응답.send('쇼핑페이지 입니다.');
})

//function은 함수 문법
//콜백함수(다른함수 파라미터에 들어가는 함수)

//유저에게 html파일을 보내주려면
app.get('/', (요청,응답) => {
    응답.sendFile(__dirname + '/index.html') 
    // __dirname은 절대경로 server.js가 담긴 폴더를 의미하는 것
    // /index.html 파일과 server.js 파일이 같은 폴더에 있기 때문에 index.html파일을 보내줄 수 있다.
})


// 누가 /news로 접속하면 DB에 무엇인가를 저장해보자
app.get('/news', (요청,응답) => { // 누군가 /news로 접속하면 오늘의뉴스!를 보여준다.
    db.collection('post').insertOne({title: '어쩌구'})
    //응답.send('오늘의 뉴스!');
})
 



// 2024-12-06 

// db.collection('post').find().toArray()
// await 문법을 사용하기 위해 (요청,응답) 앞에 aysnc를 붙여야 사용할 수 있음 
app.get('/list',  async (요청,응답) => {
  //result 변수에  await db.collection('post').find().toArray() 저장
  // MongoDB에 있는 데이터들을 불러올 때  post 라는 collection 뒤에 .find().toArray()를 사용하여 불러올 수 있다.
  // await 
  let result = await db.collection('post').find().toArray()
  console.log(result[0].title);
  응답.render('list.ejs',{posts : result});
})



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
app.get('/time', (요청,응답) => {
  응답.render('time.ejs', {지금시간:now});
})