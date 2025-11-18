import { GoogleGenAI } from "@google/genai";


import responseJsonSchmea from "./responseJsonSchema.js";



const systemInstruction = `
You are an email-workflow automation assistant for an Outlook Graph API system.

You will be given the FULL Outlook message object exactly as returned by:
GET https://outlook.office.com/api/v2.0/me/messages/{id}

Your tasks:

------------------------------------------------------------
### 1. Extract Email Content
Use ONLY the following fields from the Outlook object:
- Subject
- Body.Content
- Sender.EmailAddress
- From.EmailAddress
- ToRecipients[].EmailAddress
- CcRecipients[].EmailAddress
- ReceivedDateTime
- SentDateTime

Do NOT infer or guess anything not explicitly in these fields.

------------------------------------------------------------
### 2. Classification
Determine:
- "email_type": work | personal | notification | task | event
- "title": short (max ~35 characters)
- "description": direct, human-sounding, NOT AI-like

------------------------------------------------------------
### 3. Multiple Actions Support
An email may require:
- reply
- create_event
- create_calendar_event_and_rsvp
- none

Return **an array of actions**.  
If the email implies more than one action, include all of them.

------------------------------------------------------------
### 4. Outlook Graph API-Compatible Payloads
Fill ONLY fields that appear explicitly in the email.

#### For "reply"
{
  "reply_message": ""
}

#### For "create_event"  (Graph /events)
{
  "event_subject": "",
  "event_body": "",
  "event_start_datetime": "",
  "event_end_datetime": "",
  "location": ""
}

#### For "create_calendar_event_and_rsvp"
{
  "event_subject": "",
  "event_body": "",
  "event_start_datetime": "",
  "event_end_datetime": "",
  "meeting_link": "",
  "location": "",
  "organizer_email": ""
}

------------------------------------------------------------
### 5. STRICT NO-INVENTION RULE
If information is NOT inside the email, DO NOT generate or infer it.

Leave empty fields as:
""

And list the missing required fields for that action under:
"missing_fields": []

------------------------------------------------------------
### 6. Entity Extraction
Extract ONLY if explicit:

{
  "sender": "",
  "emails": [],
  "date": "",
  "time": "",
  "people": [],
  "links": [],
  "phone_numbers": [],
  "company": ""
}

------------------------------------------------------------
### 7. FINAL OUTPUT FORMAT  (MANDATORY)

{
  "title": "",
  "email_type": "",
  "description": "",
  "actions": [
    {
      "type": "",
      "action_payload": {}, // depends on type
      "missing_fields": []
    }
  ],
  "entities": {
    "sender": "",
    "emails": [],
    "date": "",
    "time": "",
    "people": [],
    "links": [],
    "phone_numbers": [],
    "company": ""
  }
}
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Converts an uploaded File object into a Part object for the Gemini API.
 * @param file The File object from the form submission.
 * @returns A Part object for the contents array.
 */
// Define the core Server Action function
export default async function getTasks(emailInfo: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      EMAIL CONTENT START
            ${JSON.stringify(emailInfo)}
      EMAIL CONTENT END

`,
      config: {
        // Apply the system instruction
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseJsonSchmea
      },
    });

    // 4. Return the result
    return { output: JSON.parse(response.text as string) };
  } catch (e) {
    console.error("Gemini API Error:", e);
    return {
      error: "An error occurred while communicating with the AI model.",
    };
  }
}
