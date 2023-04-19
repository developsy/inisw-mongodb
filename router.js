//각 요청 별 핸들러들을 관리하는 파일

const express = require("express");
const router = express.Router();
const todolistDao = require("./dao/todolistDao");

//수많은 라우터들을 관리할 수 있다.
router.get("/", (req, res) => {
  res.render("index", {
    title: "todolist 서비스 v1.0",
    subtitle: "(node.js + express + mongodb)",
  });
});

router.get("/todolist/:owner/create", async (req, res) => {
  const { owner } = req.params;
  const result = await todolistDao.createNewOwner({ owner });
  res.json(result);
});

// :owner -> req.params에 들어가는 것. 경로 파라미터였다.
router.get("/todolist/:owner", async (req, res) => {
  const owner = req.params.owner;
  let result = await todolistDao.getTodoList({ owner });
  res.json(result);
});

//post는 http body로 전달되므로 이를 받아와야 한다.
//json이 오면 알아서 js 객체로 변환하는 미들웨어를 server.js에 써놨다. -> app.use(express.json());
//{"todo": "asdf", "desc": "sadf"}처럼 json이 전달되면 이를 구조분해할당으로 받아온다.
router.post("/todolist/:owner", async (req, res) => {
  let { todo, desc } = req.body;
  const owner = req.params.owner;
  const result = await todolistDao.addTodo({ owner, todo, desc });
  res.json(result);
});

router.put("/todolist/:owner/:id", async (req, res) => {
  const { owner, id } = req.params;
  let { todo, completed, desc } = req.body;
  const result = await todolistDao.updateTodo({ owner, id, todo, desc, completed });
  res.json(result);
});

router.put("/todolist/:owner/:id/completed", async (req, res) => {
  const { owner, id } = req.params;
  const result = await todolistDao.toggleCompleted({ owner, id });
  res.json(result);
});

router.delete("/todolist/:owner/:id", async (req, res) => {
  const { owner, id } = req.params;
  const result = await todolistDao.deleteTodo({ owner, id });
  res.json(result);
});
//----에러 처리 시작. 계속 내려오다가 찾으려는 미들웨어가 없다면 여기서부터 에러처리가 발생한다.
router.get("*", (req, res, next) => {
  const err = new Error();
  err.status = 404;
  next(err);
});
router.use((err, req, res, next) => {
  console.log("### ERROR!!");
  if (err.status === 404) {
    res.status(404).json({ status: 404, message: "잘못된 URI 요청" });
  } else if (err.status === 500) {
    res.status(500).json({ status: 500, message: "내부 서버 오류" });
  } else {
    res.status(err.status).jsonp({ status: "fail", message: err.message });
  }
});

module.exports = router;
