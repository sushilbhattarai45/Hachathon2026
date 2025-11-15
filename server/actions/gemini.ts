import { GoogleGenAI } from "@google/genai";

const systemInstruction = `
**INSTRUCTIONS FOR LANGUAGE MODEL (LLM) — EMAIL PROCESSING AND TASK GENERATION**

**Goal:** Analyze the provided email content to generate a concise summary, extract key data points, assign a single categorization label, and determine all actionable tasks. The final output MUST strictly adhere to the specified JSON schema.

**Input:** The full content of the email provided after the delimiter.

**Processing Steps:**

1.  **Summary:** Create a concise, one-paragraph summary (3-4 sentences max) of the email's main topic, purpose, and required immediate action, if any.
2.  **Categorization:** Assign *only one* primary label from the following list that best describes the email's core purpose:
    * \`Meeting/Scheduling\`
    * \`Financial/Billing/Invoice\`
    * \`Travel/Logistics\`
    * \`Task Delegation/Request\`
    * \`Information/Update\`
    * \`Support/Technical Issue\`
    * \`Sales/Marketing/Offer\`
3.  **Key Data Extraction:** Scan the email for all instances of the following specific entities:
    * **People/Contacts:** Names, organizations, or specific roles (e.g., 'Sarah J.', 'Acme Corp').
    * **Locations:** Addresses, meeting places, or specific areas (e.g., '123 Main St', 'Conference Room A').
    * **Dates/Times:** Specific dates, day names, time ranges, or deadlines (e.g., '10/25/2026', 'next Monday 3 PM EST').
    * **Products/Projects:** Names of items, projects, or services being discussed (e.g., 'Project Phoenix', 'Q3 Budget').
4.  **Task Determination:** Identify any clear, verifiable, user-facing action required (e.g., reply, confirm, book, pay, schedule, review, purchase).
    * If **no** actionable task can be definitively created, the JSON \`tasks\` array **must be empty (\`[]\`)**.
    * If tasks exist, format each one using the required JSON object structure. Infer \`due_date\` (YYYY-MM-DD format, or \`null\` if vague) and \`priority\` ('High', 'Medium', or 'Low').

**OUTPUT FORMAT CONSTRAINT (CRITICAL):**

The entire response must be a single, valid JSON object following this schema. Do not include any text, markdown explanation, or conversational filler outside of the JSON block.

\`\`\`json
{
  "summary": "[The concise, one-paragraph summary of the email content.]",
  "category": "[One of the seven specified categories, e.g., 'Task Delegation/Request']",
  "extracted_data": {
    "people_contacts": [
      "[List of names/contacts, e.g., 'Sarah J.', 'Acme Corp']"
    ],
    "locations": [
      "[List of locations/addresses, e.g., '123 Main St', 'New York']"
    ],
    "dates_times": [
      "[List of dates/times, e.g., '10/25/2026', 'next Monday 3 PM EST']"
    ],
    "products_projects": [
      "[List of key products/projects, e.g., 'Project Phoenix', 'Q3 Budget']"
    ]
  },
  "tasks": [
    {
      "title": "[A concise, action-oriented title for the task (e.g., 'Confirm 3 PM meeting with Sarah')]",
      "description": "[A brief detail of the required action, including context or next steps.]",
      "due_date": "[The inferred date of the task deadline (YYYY-MM-DD), or null if none is present.]",
      "priority": "[The inferred priority: 'High', 'Medium', or 'Low']"
    }
    // Add additional task objects here if multiple tasks are relevant
  ]
}
\`\`\`

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
