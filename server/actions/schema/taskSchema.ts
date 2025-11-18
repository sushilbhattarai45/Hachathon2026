import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  email: { type: String, required: true },
  subject: { type: String, required: true },
  preview: { type: String, required: true },
  tasks: { type: [String], required: true },
});

export default mongoose.model("Task", taskSchema);

