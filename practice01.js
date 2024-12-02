// 처음 express 라이브러리 사용하기 위한 코드
const express = require('express');
const app = express();


// 포트 설정
app.listen(8080, () => {
    console.log('http://localhost:8080에서 서버 실행중...')
})


// 유저에게 보내줄 데이터 
// 사용자가 /about으로 접속해서 요청하면 about.html 파일 응답하기
app.get('/about', (요청,응답) => {
    응답.sendFile(__dirname + '/about.html')
})