import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tags : { type: [String], },
  name : { type: String },
  id : { type: String },
});

export default mongoose.model("User", userSchema);