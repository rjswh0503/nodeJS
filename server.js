const express = require('express') // express 라이브러리를 사용하기 위해 
const app = express()



app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중');

})

app.get('/', (요청,응답) => { // 메인페이지 접속시 반갑다가 보임;
    응답.send('반갑다');
})
