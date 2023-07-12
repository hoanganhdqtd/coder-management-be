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
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit || 10;
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Task.countDocuments({ isDeleted: false });
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
  const options = { new: true };
  // const options = { new: true, runValidators: true };

  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid ID");
    }

    //mongoose query
    const deletedTask = await Task.findByIdAndDelete(
      id,
      { isDeleted: true },
      options
    );
    if (!deletedTask) {
      throw new Error("Task not found!");
    }

    // sendResponse(
    //   res,
    //   200,
    //   true,
    //   { car: deletedCar },
    //   null,
    //   "Delete Car Successfully!"
    // );

    return res
      .status(200)
      .send({ message: "Delete Task Successfully!", deletedTask });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

// Get all tasks of 1 user by id
taskController.getTasksbyUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid User ID");
    }

    // ?
    const tasksByUserId = await Task.find({
      assignee: mongoose.SchemaTypes.ObjectId(userId),
    });

    return res
      .status(200)
      .send({ message: "Get Tasks By User ID Successfully!", tasksByUserId });
  } catch (err) {
    next(err);
  }
};

// Get a single task by id
taskController.getTaskbyId = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId)) {
      throw new Error("Invalid Task ID");
    }

    const taskById = await Task.find({
      _id: taskId,
    });

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

// assign a task to a user
taskController.assignTask = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { userId, assign } = req.body;
    if (!mongoose.isValidObjectId(taskId)) {
      throw new Error("Invalid Task ID");
    }
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid User ID");
    }
    const taskToAssign = await Task.find({ _id: taskId });

    if (!taskToAssign) {
      return res.status(404).send(`Task with ID ${taskId} not found`);
    }

    if (assign) {
      // check if the user with userId exists
      const userToAssignTask = await User.find({ _id: userId });
      if (!userToAssignTask) {
        return res.status(404).send(`User with ID ${userId} not found`);
      }

      taskToAssign.assignee = mongoose.SchemaTypes.ObjectId(userId);
    } else {
      taskToAssign.assignee = null;
    }
    await taskToAssign.save();
    return res
      .status(200)
      .send(
        assign
          ? `Assign task ${taskId} to user ${userId} successfully`
          : `UnAssign task ${taskId} successfully`
      );
  } catch (err) {
    next(err);
  }
};

// unassign a task
// taskController.unassignTask = async (req, res, next) => {
//   try {
//     const { id: taskId } = req.params;
//     if (!mongoose.isValidObjectId(taskId)) {
//       throw new Error("Invalid Task ID");
//     }

//     const taskToUnassign = await Task.find({ _id: taskId });

//     // ?
//     // taskToUnassign.assign
//   } catch (err) {
//     next(err);
//   }
// };

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
