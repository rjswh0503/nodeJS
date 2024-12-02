const { error } = require('console')
const express = require('express')
const app = express()



// 서버와 데이터베이스 연결하기 위한 코드 작성
const { MongoClient } = require('mongodb')

let db                 // 자신이 설정한 
                        //아이디:비밀번호를 넣어준다.
                        // shin:<db_password> 
const url = 'mongodb+srv://shin:153123@cluster0.ydxf4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' 
new MongoClient(url).connect().then((client) => {
    console.log('DB연결 성공!!');
    db = client.db('practice1')
    app.listen(8080, ()=> {
        console.log('http://localhost:8080 에서 연결중...')
    })



}).catch((error) => {
    console.log(error);
})


app.get('/post', (요청,응답) => {
    db.collection('post').insertOne({
        title:'바보',
        contents: '멍청이',
    })
})



