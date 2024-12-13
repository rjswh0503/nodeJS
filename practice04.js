const express = require('express');
const app = express();
const port = 8080

app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended:true}))


// 서버와 몽고디비를 연결하기 위한 코드 작성
const { MongoClient, ObjectId } = require('mongodb');


// server.js에서 css파일을 사용하기 위한 코드
// .css .js .jpg 파일들은 static파일 이라고 한다.
app.use(express.static(__dirname + "/public"));

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
    try{
        await db.collection('user').insertOne({
            name : 요청.body.name,
            email : 요청.body.email,
            password1 : 요청.body.password1,
            password2 : 요청.body.password2,
            address : 요청.body.address,
            gender : 요청.body.gender,
        })
        응답.redirect('/userList');
    } catch(e){
        console.log(e);
    }
   
})


app.get('/userList', async (요청,응답) => {
    let result = await db.collection('user').find().toArray();
    응답.render('userList.ejs', {users:result})
})


//유저 상세 페이지 복습

app.get('/detail/:id', async(요청,응답)=> {
    let result = await db.collection('user').findOne({ _id : new ObjectId(요청.params.id)})
    console.log(요청.params.id)
    응답.render('userDetail.ejs',{detail : result})
})


//유저 프로필 수정 복습

app.get('/profile/:id', async (요청,응답)=> {
    let result = await db.collection('user').findOne({_id: new ObjectId(요청.params.id)})
    응답.render('profileEdit.ejs', {edit : result})
})


app.post('/edit', async(요청,응답) => {
    try{
        if(요청.body.name == '' || 요청.body.password1 == '' || 요청.body.password2 == '' || 요청.body.email == '' || 요청.body.address == '' ){
            응답.send('입력칸에 빈칸이 있으면 안됩니다.')
        } else {
            await db.collection('user').updateOne({_id : new ObjectId(요청.body.id)}, {$set: {name : 요청.body.name, password1: 요청.body.password1, password2: 요청.body.password2, email: 요청.body.email, address: 요청.body.address,} })
            응답.redirect(`/detail/${요청.body.id}`)
        }
    }catch(e){
        console.log(e)
        응답.status(500).send("서버에러~")
    }
     
})



// DB에 저장된 데이터 삭제 복습

app.delete('/delete', async(요청,응답) => {
    try{
        await db.collection('user').deleteOne({ _id : new ObjectId(요청.query.docid)})
        응답.send('삭제완료!')
    }catch(e){
        console.log(e)
    }
   
})

