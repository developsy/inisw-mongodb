const mongoose = require("mongoose");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

let uri = proess.env.MONGODB_URI ? process.env.MONGODB_URI : "mongodb://127.0.0.1:27017/todolistdb";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const todoSchema = new mongoose.Schema({
  _id: { type: String, default: () => new ObjectId().toHexString() },
  owner: String,
  todo: String,
  desc: String,
  completed: { type: Boolean, default: false },
});

const Todo = mongoose.model("todos", todoSchema);
