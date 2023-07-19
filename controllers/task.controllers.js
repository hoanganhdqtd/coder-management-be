const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

const taskController = {};

// const taskStatus = ["pending", "working", "review", "done", "archive"];

//Create a task
taskController.createTask = async (req, res, next) => {
  //in real project you will getting info from req
  try {
    //always remember to control your inputs
    const { name, description, assignee, status } = req.body;
    if (!name || !description || !status) {
      throw new Error("Missing required info!");
    }

    // if (!taskStatus.includes(status.trim().toLowerCase())) {
    //   throw new Error("Task status invalid!");
    // }

    // const newTask = await new Task({}).save();
    const newTask = await Task.create({
      name,
      description,
      // status: status.trim().toLowerCase(),
      status,
    });

    if (assignee) {
      newTask.assignee = assignee;
    }

    return res
      .status(200)
      .send({ message: "Create Task Successfully!", task: newTask });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//Get all tasks
taskController.getTasks = async (req, res, next) => {
  //in real project you will getting condition from req then construct the filter object for query
  // empty filter mean get all
  try {
    // const allowedFilter = ["name", "status"];
    let { page, limit, name, status, sort } = req.query;
    let query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    // help sorting by createdAt, updatedAt
    if (sort && sort.toLowerCase() === "updatedAt".toLowerCase()) {
      sort = "updatedAt";
    } else {
      sort = "createdAt";
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    //allow title,limit and page query string only
    // const filterKeys = Object.keys(filterQuery);
    // filterKeys.forEach((key) => {
    //   if (!allowedFilter.includes(key)) {
    //     const exception = new Error(`Query ${key} is not allowed`);
    //     exception.statusCode = 401;
    //     throw exception;
    //   }
    //   if (!filterQuery[key]) delete filterQuery[key];
    // });
    const tasks = await Task.find(query)
      .sort({ [sort]: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Task.countDocuments({ ...query, isDeleted: false });
    return res.status(200).json({
      message: "Get Task List Successfully!",
      tasks,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//Update a task
taskController.editTask = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  //you will also get updateInfo from req
  // empty target and info mean update nothing
  // const targetId = null;
  // const updateInfo = "";

  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  // const options = { new: true, runValidators: true };
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }

    //mongoose query
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...req.body },
      options
    );

    if (!updatedTask) {
      throw new Error("Task not found!");
    }
    return res
      .status(200)
      .send({ message: "Update Task Successfully!", updatedTask });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//Delete task (soft delete)
taskController.deleteTask = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication

  // empty target mean delete nothing
  // const targetId = null;

  //options allow you to modify query. e.g new true return lastest update of data
  // const options = { new: true };
  // const options = { new: true, runValidators: true };

  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }

    //mongoose query
    // const deletedTask = await Task.findByIdAndDelete(
    //   id,
    //   { isDeleted: true },
    //   options
    // );
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      throw new Error("Task not found!");
    }

    // sendResponse(
    //   res,
    //   200,
    //   true,
    //   { task: deletedTask },
    //   null,
    //   "Delete Task Successfully!"
    // );

    return res
      .status(200)
      .send({ message: "Delete Task Successfully!", deletedTask });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

// Get all tasks of 1 user by userId
taskController.getTasksbyUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid User ID");
    }

    // ?
    const tasksByUserId = await Task.find({
      // assignee: mongoose.SchemaTypes.ObjectId(userId),
      // assignee: new mongoose.Types.ObjectId(userId),
      assignee: userId,
    });

    return res
      .status(200)
      .send({ message: "Get Tasks By User ID Successfully!", tasksByUserId });
  } catch (err) {
    next(err);
  }
};

// Get a single task by id and populate assignee field
taskController.getTaskbyId = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      throw new Error("Invalid Task ID");
    }

    // const taskById = await Task.find({
    //   _id: taskId,
    // });

    // const taskById = await Task.find({
    //   _id: taskId,
    // }).populate("assignee");

    const taskById = await Task.findOne({
      _id: taskId,
    }).populate("assignee");

    if (taskById) {
      return res
        .status(200)
        .send({ message: "Get Task By Task ID Successfully!", taskById });
    } else {
      return res.status(404).send(`Task with ID ${taskId} not found`);
    }
  } catch (err) {
    next(err);
  }
};

// assign or unassign a task to a user
/*
  {
    "assign": false,
    "userId": "64a96646d1d335d4e718beb5"
  }
*/
taskController.assignTask = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;

    const { userId } = req.body;

    // check if taskID is valid
    if (!mongoose.isValidObjectId(taskId)) {
      throw new Error("Invalid Task ID");
    }

    // check if userId is valid
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid User ID");
    }
    // const taskToAssign = await Task.find({ _id: taskId });
    const taskToAssign = await Task.findOne({ _id: taskId });

    if (!taskToAssign) {
      return res.status(404).send(`Task with ID ${taskId} not found`);
    }

    // check if the user with userId exists
    // const userToAssignTask = await User.find({ _id: userId });
    const userToAssignTask = await User.findOne({ _id: userId });
    if (!userToAssignTask) {
      return res.status(404).send(`User with ID ${userId} not found`);
    }

    if ("assign" in req.body) {
      const { assign } = req.body;
      if (!assign) {
        // unassign
        if (!taskToAssign.assignee) {
          return res
            .status(404)
            .send(`Task with ${taskId} has not been assigned yet`);
        } else {
          await Task.updateOne({ _id: taskId }, { $unset: { assignee: "" } });
          return res.status(200).send(`Unassign task ${taskId} successfully`);
        }
      } else {
        // check if taskId has been assigned to the userId
        // taskToAssign.assignee: ObjectId("")
        if (
          taskToAssign.assignee &&
          taskToAssign.assignee.valueOf() === userId
        ) {
          return res
            .status(404)
            .send(
              `Task with ${taskId} has already been assigned to the user with ID ${userId}`
            );
        }
        // assign or reassign the task to a new user
        await Task.updateOne({ _id: taskId }, { $set: { assignee: userId } });
        return res
          .status(200)
          .send(`Assign task ${taskId} to user ${userId} successfully`);
      }
    } else {
      // assign by default

      // check if taskId has been assigned to the userId
      // taskToAssign.assignee: ObjectId("")
      if (taskToAssign.assignee && taskToAssign.assignee.valueOf() === userId) {
        return res
          .status(404)
          .send(
            `Task with ${taskId} has already been assigned to the user with ID ${userId}`
          );
      }

      await Task.updateOne({ _id: taskId }, { $set: { assignee: userId } });
      return res
        .status(200)
        .send(`Assign task ${taskId} to user ${userId} successfully`);
    }
  } catch (err) {
    next(err);
  }
};

// unassign a task
taskController.unassignTask = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      throw new Error("Invalid Task ID");
    }

    const taskToUnassign = await Task.find({ _id: taskId });

    if (!taskToUnassign) {
      return res.status(404).send(`Task with ID ${taskId} not found`);
    }

    // ?
    // taskToUnassign.assignee = null;
    // await taskToUnassign.update();
    await Task.updateOne({ _id: taskId }, { $unset: { assignee: "" } });
  } catch (err) {
    next(err);
  }
};

// update task status
taskController.editTaskStatus = async (req, res, next) => {
  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  // const options = { new: true, runValidators: true };
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }

    const allowFields = ["status", "name", "description", "assignee"];

    for (let field of Object.keys(req.body)) {
      if (!allowFields.includes(field)) {
        delete req.body[field];
      }
    }

    const { status } = req.body;

    //mongoose query
    const taskToUpdate = await Task.findById(id);

    if (!taskToUpdate) {
      throw new Error("Task not found!");
    }

    if (status) {
      if (taskToUpdate.status === "done" && status !== "archive") {
        throw new Error(
          "Cannot update task status from 'done' to anything other than 'archive'!"
        );
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...req.body },
      options
    );

    return res
      .status(200)
      .send({ message: "Update Task Successfully!", updatedTask });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//export
module.exports = taskController;
