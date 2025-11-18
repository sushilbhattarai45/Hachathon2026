const jsonSchema = {
  "title": "EmailAutomationResponse",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "title": {
      "type": "string",
      "description": "Short title that fits 1–2 lines on mobile."
    },
    "today_date": {
      "type": "string",
      "description": "Today's date in ISO format"
      },
    "messageId": {
      type: "string",
      description: "The message ID of the email"
      },
    "show": {
      type: "boolean",
      description: "Whether to show the email in the UI based on its content"
      },
    "email_type": {
      "type": "string",
      "enum": ["work", "personal", "notification", "task", "event"],
      "description": "Category of email."
    },
    "description": {
      "type": "string",
      "description": "A natural, direct summary."
    },
    "actions": {
      "type": "array",
      "description": "List of actions extracted from the email.",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "reply",
              "create_event",
              "create_calendar_event_and_rsvp",
              "none"
            ],
            "description": "Action type."
          },
          "action_payload": {
            "type": "object",
            "description": "Action payload. Only fields relevant to the action type will be populated.",
            "additionalProperties": false,
            "properties": {
              "reply_message": {
                "type": "string",
                "description": "Message body for reply. Empty if irrelevant."
              },
              "event_subject": {
                "type": "string",
                "description": "Event subject. Empty if missing or irrelevant."
              },
              "event_body": {
                "type": "string",
                "description": "Event body. Empty if missing or irrelevant."
              },
              "event_start_datetime": {
                "type": "string",
                "description": "Start datetime (ISO). Empty if missing.",
                "format": "date-time"
              },
              "event_end_datetime": {
                "type": "string",
                "description": "End datetime (ISO). Empty if missing.",
                "format": "date-time"
              },
              "location": {
                "type": "string",
                "description": "Event location. Empty if missing."
              },
              "meeting_link": {
                "type": "string",
                "description": "Meeting link for RSVP events."
              },
              "organizer_email": {
                "type": "string",
                "description": "Organizer email for RSVP events."
              }
            }
          },
          "missing_fields": {
            "type": "array",
            "description": "List of required fields missing from the email.",
            "items": {
              "type": "string"
            }
          }
        },
        "required": ["type", "action_payload", "missing_fields"]
      }
    },
    "entities": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "sender": {
          "type": "string",
          "description": "Sender name or email."
        },
        "emails": {
          "type": "array",
          "description": "All emails mentioned.",
          "items": {
            "type": "string"
          }
        },
        "date": {
          "type": "string",
          "description": "Date mentioned in the email (if any)."
        },
        "time": {
          "type": "string",
          "description": "Time mentioned in the email (if any)."
        },
        "people": {
          "type": "array",
          "description": "People referenced.",
          "items": {
            "type": "string"
          }
        },
        "links": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "phone_numbers": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "company": {
          "type": "string"
        }
      },
      "required": [
        "sender",
        "emails",
        "date",
        "time",
        "people",
        "links",
        "phone_numbers",
        "company"
      ]
    }
  },
  "required": [
    "title",
    "email_type",
    "description",
    "actions",
    "entities"
  ]
}
export default jsonSchema;
