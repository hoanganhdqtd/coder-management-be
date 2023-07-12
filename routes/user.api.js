const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  editUser,
  deleteUser,
} = require("../controllers/user.controllers");

//Read
/**
 * @route GET api/user
 * @description get list of users
 * @access public
 */
router.get("/", getUsers);

//Create
/**
 * @route POST api/user
 * @description create a user
 * @access public
 */
router.post("/", createUser);

//Update
/**
 * @route PUT api/user
 * @description update a user
 * @access public
 */
router.put("/:id", editUser);

//Delete
/**
 * @route DELETE api/user
 * @description delete a user
 * @access public
 */
router.delete("/:id", deleteUser);

//export
module.exports = router;
