const express = require('express');
const app = express();
const port = 8080

app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended:true}))


// 서버와 몽고디비를 연결하기 위한 코드 작성
const { MongoClient } = require('mongodb');


let db 

const url = 'mongodb+srv://shin:153123@cluster0.ydxf4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client) => {
    console.log('DB연결 성공!!');
    db = client.db('practice2')
    app.listen(port, () => {
        console.log('http://localhost:8080 에서 연결중.....');
    })

}).catch((error) => {
    console.log(error);
})


app.get('/', (요청,응답) => {
    응답.render('user.ejs');
})

app.post('/add', async(요청,응답) => {
   await db.collection('user').insertOne({
        name : 요청.body.name,
        email : 요청.body.email,
        password1 : 요청.body.password1,
        password2 : 요청.body.password2,
        address : 요청.body.address,
        man : 요청.body.man,
        girl : 요청.body.girl
    })
    응답.redirect('/userList');
})


app.get('/userList', async (요청,응답) => {
    let result = await db.collection('user').find().toArray();
    응답.render('userList.ejs', {users:result})
})

