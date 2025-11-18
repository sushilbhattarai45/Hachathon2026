import { GoogleGenAI } from "@google/genai";


import responseJsonSchmea from "./responseJsonSchema.js";



const systemInstruction = 
`

You are an email workflow assistant for Outlook Graph API.

You will be given the FULL Outlook message object exactly as returned by:
GET https://outlook.office.com/api/v2.0/me/messages/{id}




------------------------------------------------------------
### 0. Show Flag and Promotions Handling
- If the email is explicitly a promotion, advertisement, or junk (based on subject, sender, or categories), set "show": false.
- Otherwise, "show": true.
- Include "show", "message_id", and today's date in the output as "today_date".

### Date & Time Handling
- Today’s date will be provided as 'current_date' in YYYY-MM-DD format.
- Detect any date or time mentioned in the email body or subject, including relative terms like "tomorrow", "next Monday", "in 2 days".
- Convert the detected date and time into **ISO 8601 format** (e.g., 2025-11-18T06:48:02.160Z).
- If the email mentions only a date but no specific time, set the time to **23:59:00 UTC**.
- Store the resulting value in entities.date for date-time references.

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
- Id (use this for message_id)

Rules:
- Summarize the email body to **10–12 words max**.
- For title, extract a **short, 3–5 word relevant title** (not the original subject).
- Trim slashes or special characters from title/description, but keep spaces.

------------------------------------------------------------
### 2. Detect Dates
- Detect any explicit or relative dates in the email (e.g., "tomorrow", "next Monday").
- Convert them to **YYYY-MM-DD** format and store in entities date field.
- If multiple dates exist, store the earliest relevant one.
- Do not invent dates; only use what can be inferred logically.

------------------------------------------------------------
### 3. Classification
- Determine email type: work | personal | notification | task | event.

------------------------------------------------------------
### 4. Actions
- Identify actions: reply, create_event, create_calendar_event_and_rsvp, or none.
- Return as an array, each with:
  - type
  - action_payload (Graph API-compatible fields)
  - missing_fields (required but unavailable fields)

------------------------------------------------------------
### 5. Entity Extraction
Extract ONLY explicit information:
{
  "sender": "",
  "emails": [],
  "date": "",        // the inferred email date
  "time": "",
  "people": [],
  "links": [],
  "phone_numbers": [],
  "company": ""
}

------------------------------------------------------------
### 6. STRICT RULES
- Do NOT infer anything not in the email.
- Include only requested fields.
- Leave missing fields empty or in missing_fields array.
- Summaries must be short and human-readable.

------------------------------------------------------------
### 7. Output Format (MANDATORY)
Return EXACTLY this JSON structure:

{
  "message_id": "",
  "today_date": "",
  "title": "",
  "email_type": "",
  "description": "",
  "show": true,
  "actions": [
    {
      "type": "",
      "action_payload": {},
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

------------------------------------------------------------
### Example Behavior
- Long email body -> shorten description to 10–12 words.
- Title -> 3–5 words capturing the main action or info.
- Email says "meeting tomorrow" -> entities.date = tomorrow's date in YYYY-MM-DD.
- Promotions are marked show: false.
- All other rules strictly enforced.

`
const prompt = `
Today’s date is: ${new Date().toISOString().split('T')[0]}
${systemInstruction}
`

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
        systemInstruction: prompt,
        responseMimeType: "application/json",
        responseSchema: responseJsonSchmea,
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
