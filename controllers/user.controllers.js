const mongoose = require("mongoose");
const User = require("../models/User");

const userController = {};

//Create a user
userController.createUser = async (req, res, next) => {
  //in real project you will getting info from req
  try {
    //always remember to control your inputs

    // role: employee / manager
    const { name, role } = req.body;
    if (!name) {
      throw new Error("Missing required info!");
    }

    // check if user's name existed in the collection
    const nameCount = await User.find({ name }).count();
    if (nameCount) {
      throw new Error("User's name existed. Please input new one.");
    }

    // const newUser = await new User({}).save();
    const newUser = await User.create({
      name,
      role,
    });

    return res
      .status(200)
      .send({ message: "Create User Successfully!", user: newUser });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//Get all users
userController.getUsers = async (req, res, next) => {
  //in real project you will getting condition from req then construct the filter object for query
  // empty filter mean get all
  try {
    let users, total;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (search) {
      users = await User.find({
        name: { $regex: search, $options: "i" },
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      total = await User.countDocuments({
        isDeleted: false,
        name: { $regex: search, $options: "i" },
      });
    } else {
      users = await User.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      total = await User.countDocuments({
        isDeleted: false,
      });
    }

    return res.status(200).json({
      message: "Get User List Successfully!",
      users,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//Update a user
userController.editUser = async (req, res, next) => {
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
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...req.body },
      options
    );

    if (!updatedUser) {
      throw new Error("User not found!");
    }
    return res
      .status(200)
      .send({ message: "Update User Successfully!", updatedUser });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//Delete user
userController.deleteUser = async (req, res, next) => {
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
    const deletedUser = await User.findByIdAndDelete(
      id,
      { isDeleted: true },
      options
    );
    if (!deletedUser) {
      throw new Error("User not found!");
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
      .send({ message: "Delete User Successfully!", deletedUser });
  } catch (err) {
    // res.status(400).send({ message: err.message });
    next(err);
  }
};

//export
module.exports = userController;
