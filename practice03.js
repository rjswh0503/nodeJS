const express = require('express');
const app = express();
const port = 8080

// 서버와 몽고디비를 연결하기 위한 코드 작성
const { MongoClient } = require('mongodb');


let db 

const url = 'mongodb+srv://shin:153123@cluster0.ydxf4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client) => {
    console.log('DB연결 성공!!');
    db = client.db('practice1')
    app.listen(port, () => {
        console.log('http://localhost:8080 에서 연결중.....');
    })

}).catch((error) => {
    console.log(error);
})



// mongoDB에 저장된 데이터를 불러오기 위한 코드 작성
app.get('/list', async(요청,응답) => {
   let result = await db.collection('post').find().toArray()
   console.log(result[0]);
   응답.send(result[0]);
});

