import fetch from "node-fetch";
// --- Configuration ---
/**
 * NOTE: Replace this placeholder with a valid, current access token.
 */
const BASE_URL: string = "https://graph.microsoft.com/v1.0/me";

// ----------------------------------------------------------------------
// --- Type Definitions (Interfaces) ---
// ----------------------------------------------------------------------

interface EmailAddress {
  address: string;
  name: string;
}

interface Attendee {
  emailAddress: EmailAddress;
  type: "required" | "optional" | "resource";
}

interface DateTimeTimeZone {
  dateTime: string; // ISO 8601 format, e.g., "2025-12-01T10:00:00"
  timeZone: string; // e.g., "America/Chicago"
}

interface EventBodyContent {
  contentType: "HTML" | "Text";
  content: string;
}

/**
 * Interface for creating a new Outlook Event (Meeting Invite or Calendar Event)
 */
interface MeetingDetails {
  subject: string;
  body: EventBodyContent;
  start: DateTimeTimeZone;
  end: DateTimeTimeZone;
  attendees: Attendee[];
}

/**
 * Interface for specifying Due/Reminder details for a Task
 */

// ----------------------------------------------------------------------
// --- Core API Helper Function ---
// ----------------------------------------------------------------------

/**
 * Helper function to call the Microsoft Graph API.
 * @param endpoint - The Graph API endpoint (e.g., '/events').
 * @param method - The HTTP method ('GET' | 'POST' | 'PATCH' | 'DELETE').
 * @param body - The JSON body for POST/PATCH requests.
 * @returns The JSON response data from the API.
 */
async function callGraphApi<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body: object | null = null,
  accessToken: string ,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Graph API error: ${response.status} - ${errorText}`);
    }

    // Handle 204 No Content (successful delete or update)
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {
        message: `${method} successful, no content returned.`,
      } as unknown as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// --- 1. Calendar and Meeting Functions ---
// ----------------------------------------------------------------------

/**
 * 📅 Sends a meeting invite, creates the event, and generates a Teams link.
 */
export async function sendMeetingInvite(
  eventDetails: MeetingDetails,
  accessToken: string,
): Promise<any> {
  console.log("Creating and sending meeting invite...");
  const eventBody = {
    ...eventDetails,
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
  };

  return await callGraphApi("/events", "POST", eventBody, accessToken);
}

/**
 * 📅 Adds a personal event to the calendar (no invite sent).
 */
export async function addPersonalCalendarEvent(
  eventDetails: MeetingDetails,
  accessToken: string,
): Promise<any> {
  console.log("Adding personal event to calendar...");
  return await callGraphApi("/events", "POST", eventDetails, accessToken);
}

// ----------------------------------------------------------------------
// --- 2. Email Functions ---
// ----------------------------------------------------------------------

/**
 * ✉️ Replies to a specific email message.
 */
export async function replyEmail(
  messageId: string,
  replyContent: string,
  accessToken: string,
): Promise<{ message: string }> {
  console.log(`Replying to message ID: ${messageId}`);
  const body = {
    message: {
      comment: replyContent,
    },
  };
  return await callGraphApi(`/messages/${messageId}/reply`, "POST", body, accessToken);
}

// ----------------------------------------------------------------------
// --- 3. Task/To Do Functions ---
// ----------------------------------------------------------------------

/**
 * ✅ Finds a task list by name. If it doesn't exist, it creates it.
 * @returns The ID of the task list.
 */
export async function getOrCreateTaskList(listName: string, accessToken:string): Promise<string> {
  console.log(`Looking for or creating task list: "${listName}"`);

  // 1. Check if the list already exists
  const listsResponse = await callGraphApi<{
    value: { id: string; displayName: string }[];
  }>("/todo/lists", "GET",null,accessToken);

  const existingList = listsResponse.value.find(
    (list) => list.displayName === listName,
  );

  if (existingList) {
    console.log(`Found existing list: ${existingList.id}`);
    return existingList.id;
  }

  // 2. If not found, create the new list
  console.log(`List "${listName}" not found. Creating a new list...`);
  const createBody = { displayName: listName };
  const newListResponse = await callGraphApi<{ id: string }>(
    "/todo/lists",
    "POST",
    createBody,
    accessToken
  );
  console.log(`New list created with ID: ${newListResponse.id}`);
  return newListResponse.id;
}

/**
 * ✅ Adds a task/reminder to a dynamically fetched list.
 */
export async function addTaskOrReminder(
  title: string,
  reminderDetails: any = {},
  accessToken: string,
  listName: string = "Jotly",
): Promise<any> {

  if(reminderDetails.dueDateTime)
  {
    reminderDetails.dueDateTime.timeZone = "America/Chicago"
    if(!reminderDetails.dateTime.includes("T"))
    {
      reminderDetails.dateTime = reminderDetails.dateTime+"T23:59:59"
    }
  }
 
let payload ={
  title: title,
  dueDate :reminderDetails.dueDateTime,
  isReminderOn: true,
  reminderDate :reminderDetails?.end?.dateTime,
}
let dueDate = reminderDetails.dueDateTime

console.log(reminderDetails)

  console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyy")
  const listId = await getOrCreateTaskList(listName, accessToken);
  console.log(`Adding task "${title}" to list ID: ${listId}`);

  const body = {
    title: title,
    dueDate,
    isReminderOn: true,
    important: true,
  };

  return await callGraphApi(`/todo/lists/${listId}/tasks`, "POST", body, accessToken);
}
