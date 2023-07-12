var express = require("express");
var router = express.Router();
const usersRouter = require("./user.api");
const tasksRouter = require("./task.api");

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// router.get("/", function (req, res, next) {
//   res.status(200).send("Welcome to CoderSchool!");
// });

router.use("/user", usersRouter);
router.use("/task", tasksRouter);

module.exports = router;
