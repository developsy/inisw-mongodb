//미들웨어들을 관리하는 파일

const express = require("express");
const path = require("path");
const cors = require("cors"); // 리액트 관련
const morgan = require("morgan"); // 로깅관련 미들웨어였다
const fs = require("fs");
const rfs = require("rotating-file-stream");
const dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV && process.env.NODE_ENV === "production" ? "production" : "development";
//개발모드일 때만 .env파일을 로딩해서 사용한다.
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

//라우터 객체 임포트
const router = require("./router");
const startServer = async () => {
  const BASEDIR = process.env.BASEDIR || path.resolve(".");
  const LOGDIR = process.env.LOGDIR || path.join(BASEDIR, "/log");
  const PORT = process.env.PORT || 8080;

  const logger = (req, res, next) => {
    console.log(`${req.method}, ${req.url}`);
    next();
  };

  const app = express();

  //로깅 관련
  fs.existsSync(LOGDIR) || fs.mkdirSync(LOGDIR);
  const accessLogStream = rfs.createStream("access.log", {
    interval: "1d", // 매일 매일 로그 파일 생성
    path: LOGDIR,
  });
  app.use(morgan("combined", { stream: accessLogStream }));

  //미들웨어들.
  app.use(cors());
  app.use(logger);
  app.use(express.static(BASEDIR + "/public"));
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  //html 화면을 보여주는 엔진으로 ejs를 모델로 지정한 것.
  app.set("views", BASEDIR + "/views");
  app.set("view engine", "ejs");
  app.engine("html", require("ejs").renderFile);
  app.use(express.json());
  //쿠키를 저장하지 말라는 미들웨어
  app.use(function (req, res, next) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
  });

  app.use(router);

  app.listen(PORT, () => {
    console.log(`#### ${PORT} 에서 서버가 시작되었습니다`);
  });
};
startServer();
