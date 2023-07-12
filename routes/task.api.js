const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  editTask,
  deleteTask,
  getTaskbyId,
  assignTask,
  unassignTask,
  editTaskStatus,
} = require("../controllers/task.controllers");

//Read
/**
 * @route GET api/task
 * @description get list of tasks
 * @access public
 */
router.get("/", getTasks);

//Create
/**
 * @route POST api/task
 * @description create a task
 * @access public
 */
router.post("/", createTask);

//Update
/**
 * @route PUT api/task
 * @description update a task
 * @access public
 */
router.put("/:id", editTaskStatus);

//Delete
/**
 * @route DELETE api/task
 * @description delete a task
 * @access public
 */
router.delete("/:id", deleteTask);

// Get task by id
/**
 * @route GET api/task
 * @description get task by id
 * @access public
 */
router.get("/:id", getTaskbyId);

//Assign task
/**
 * @route PUT api/task
 * @description assign a task
 * @access public
 */
// router.put("/:id", assignTask);

// Unassign a task
/**
 * @route PUT api/task
 * @description unassign a task
 * @access public
 */
// router.put("/:id", unassignTask);

//export
module.exports = router;
