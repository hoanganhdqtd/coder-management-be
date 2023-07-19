const { param, body } = require("express-validator");
const { ObjectId } = require("mongodb");

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
router.post(
  "/",
  body("name").isString().trim().notEmpty(),
  body("role").isString().trim().notEmpty(),
  createUser
);

//Update
/**
 * @route PUT api/user
 * @description update a user
 * @access public
 */
router.put(
  "/:id",
  param("id").customSanitizer((value) => ObjectId(value)),
  editUser
);

//Delete
/**
 * @route DELETE api/user
 * @description delete a user
 * @access public
 */
router.delete(
  "/:id",
  param("id").customSanitizer((value) => ObjectId(value)),
  deleteUser
);

//export
module.exports = router;
