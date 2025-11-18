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
    message_id: { type: String, required: true },

    today_date: { type: String, default: "" },

    title: { type: String, default: "" },

    email_type: { type: String, default: "" },

    description: { type: String, default: "" },

    show: { type: Boolean, default: true },

    actions: { type: [ActionSchema], default: [] },

    entities: { type: EntitiesSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
