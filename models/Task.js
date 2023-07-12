const mongoose = require("mongoose");
//Create schema
const taskSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignee: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    // assignee: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },

    status: {
      type: String,
      required: true,
      enum: ["pending", "working", "review", "done", "archive"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
