const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV && process.env.NODE_ENV === "production" ? "production" : "development";
//production 환경이라면 env2를, 아니면 env1을 사용하도록 함. 환경 변수는 몇 개든지 만들 수 있다.
if (process.env.NODE_ENV === "production") dotenv.config({ path: __dirname + "/.env2" });
else dotenv.config();

const logger = function (req, res, next) {
  console.log(`${req.method} ${res.url}`);
  next();
};

// 미들웨어들
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// public 디렉토리의 문서는 정적인 것으로 간주한다.
app.use(express.static(__dirname + "public"));
app.use(cookieParser(process.env.SECRET));

app.get("/cookie", async (req, res) => {
  res.cookie("key1", "value1", { httpOnly: true, maxAge: 60 * 60 * 1000, signed: true });
  res.send("<h1>쿠키 생성 완료</h1>");
});

app.get("/cookie_check", (req, res) => {
  res.send(`<h1>쿠키 확인: ${req.signedCookies.key1}</h1><hr/>`);
});

// '/'와 같은 경로로 get 방식의 요청을 받으면 다음과 같이 응답하겠다.
app.get("/", async (req, res) => {
  console.log(`${req.method} GET ${req.url}`);
  //json 메서드를 사용하면 writeHead 메서드를 사용하지 않아도 Content-type이 자동으로 json이 됨.
  res.json({ requrl: req.url, mas: "helloworld" });
});

app.get("/ko", async (req, res) => {
  res.json({ requrl: req.url, mas: "안녕" });
});

app.get("/html", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//app.use(logger); -> 위에 있는 핸들러에 next 메서드가 없다면 이는 사용할 수가 없음. /ko 에 next가 있다면 /ko로 요청해야만 logger가 실행됨

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT} 포트에서 서버 구동`);
});
