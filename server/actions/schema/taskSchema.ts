import mongoose from "mongoose";

const ActionSchema = new mongoose.Schema({
  type: { type: String, default: "" },
  action_payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  missing_fields: { type: [String], default: [] }
});

const EntitiesSchema = new mongoose.Schema({
  sender: { type: String, default: "" },
  emails: { type: [String], default: [] },
  date: { type: String, default: "" },
  time: { type: String, default: "" },
  people: { type: [String], default: [] },
  links: { type: [String], default: [] },
  phone_numbers: { type: [String], default: [] },
  company: { type: String, default: "" }
});
const TaskSchema = new mongoose.Schema(
  {
    message_id: { type: String, required: true, unique: true },

    today_date: { type: Date, default: new Date() },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      empty: [false, "Title cannot be empty"],
      minlength: [1, "Title cannot be empty"],
    },

    email_type: { type: String, default: "" },
    user_email: { type: String, default: "" },
    iconType: { type: String, default: "" },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [1, "Description cannot be empty"],
    },

    show: { type: Boolean, default: true },
    isactionComplete: { type: Boolean, default: false },
    actions: { type: [ActionSchema], default: [] },

    entities: { type: EntitiesSchema, default: () => ({}) },
  },
  { timestamps: true }
);


export default mongoose.model("Task", TaskSchema);
