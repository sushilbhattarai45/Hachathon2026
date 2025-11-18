{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EmailWorkflowAutomationOutput",
  "type": "object",
  "properties": {
    "message_id": {
      "type": "string",
      "description": "The unique ID of the original Outlook message."
    },
    "today_date": {
      "type": "string",
      "description": "The current date/time used for relative interpretation (ISO 8601 format)."
    },
    "title": {
      "type": "string",
      "description": "A short title (<= 35 characters) summarizing the email."
    },
    "email_type": {
      "type": "string",
      "enum": ["work", "personal", "notification", "task", "event"],
      "description": "Classification of the email content."
    },
    "description": {
      "type": "string",
      "description": "Short, concise, natural language summary of the essential information."
    },
    "show": {
      "type": "boolean",
      "description": "Flag to determine if the email should be displayed (false for clear spam/promotion)."
    },
    "iconType": {
      "type": "string",
      "enum": ["general", "event", "urgent", "task", "notification", "personal", "promotion"],
      "description": "The icon representation based on classification and urgency."
    },
    "actions": {
      "type": "array",
      "description": "List of suggested actions for the user.",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["reply", "create_meeting_invite", "create_calendar_event", "create_task", "link", "none"],
            "description": "The action type."
          },
          "action_payload": {
            "type": "object",
            "description": "The data payload specific to the action type."
            // NOTE: Detailed schema validation for action_payload depends on the 'type' field and is complex
            // to represent fully in simple draft-07 without 'oneOf' or external definitions.
          },
          "missing_fields": {
            "type": "array",
            "items": { "type": "string" },
            "description": "List of required fields for the action that could not be extracted."
          }
        },
        "required": ["type", "action_payload", "missing_fields"],
        "additionalProperties": false
      }
    },
    "entities": {
      "type": "object",
      "description": "Structured data extracted explicitly from the email body/headers.",
      "properties": {
        "sender": { "type": "string" },
        "emails": { "type": "array", "items": { "type": "string" } },
        "date": { "type": "string" },
        "time": { "type": "string" },
        "people": { "type": "array", "items": { "type": "string" } },
        "links": { "type": "array", "items": { "type": "string" } },
        "phone_numbers": { "type": "array", "items": { "type": "string" } },
        "company": { "type": "string" }
      },
      "required": ["sender", "emails", "date", "time", "people", "links", "phone_numbers", "company"],
      "additionalProperties": false
    }
  },
  "required": [
    "message_id",
    "today_date",
    "title",
    "email_type",
    "description",
    "show",
    "iconType",
    "actions",
    "entities"
  ],
  "additionalProperties": false
}
