import fetch from "node-fetch";
// --- Configuration ---
/**
 * NOTE: Replace this placeholder with a valid, current access token.
 */
const ACCESS_TOKEN: string = "EwBYBMl6BAAUBKgm8k1UswUNwklmy2v7U/S+1fEAAUyL1jUwjJF/pkYiNzTtCEg8EZ9wP9MTFIjTYFNuUWrbkpfnEW6p/uYzjvvQF1MTFVDLgOmMiOSMlYUIaHAh6eUlR6e0p/9a/lt6iGQ3dUDfncY37pOqlLpxyJGzDKFJ4EuWrTo5PiLCfrkqG1w1E3iq/v1Mn52uUuBRyVc1OiJk1rTI1NRnxMkc0HYhjNPZhNF57PFKjtwjFe4xNyXXJ9cnJV04oXCzrtEGc2acy57ZRMSZVukGppN3nCWQ7JEw0MgGzF0+opIcEA0zwSkQHf7+x1QpgfcNVZQKkHdC/a6t8Coq86HafHSX8+aaiMzfosXEPecKzfUP82mcWYuEWXAQZgAAEGW76OcmHrbuW3cKzIpXgfogA2ChMGGGkFb10DrdvKAngAGkZsoqyFSx1uTaIQyr5UCFyVS1vZX4mh9CnwI4wTv2v1Y7nWnYRIu2wdTgDu33N8KJHCddUQnOSiPsY8Y/bwf/IIH1iCpbFUYgdz4mFS7OXHdtAks7bn/yD9T8goJ/Qs8TFpdDNnIVdxncAyHE+wvvhzvHoH+kbNeo05jsbwWJxoGY9BQ+U+g5AtHr3v1ut+xfdkJZAYUpVLyoLmko0EKGZxg/tO/wOaDUYXsJn7H8kro48/cVVobZ2OInhg0LJJqxMkRhdEco+vZDynKMAoZobB3aRp5Bp9IWQ8uTTcZpuHpj4D6DvaCuW+VW6LQ0WaZfJDRoapz97a1V/hu04/27sA9oOdkDn6Rg5QnOlnoNjI6IWM7abU561SZOqXg5D4kp2B+GfRdJbLtrys3n9ZmhsCgVFpGg1kIw+JjCVFd0zoq/kxUW9tArhnYXhy3x4iFGT8i4sCuRFJ/feEqnmRcvQ2hTmOMAdIvuf7TpOSRaz1QfIizX+Qs6eBzLfREeTBcHeZfiBZGPPNQthatTPPdE5J5ZhWtWiKq6nD20tTl0syzhuSyfATKonUqvEIfr+/PI22QcQWC2Uss2VsrzBRk3EYlt/OAo3PG6W1dcHLOAcdHLDrP55AIpX7TTd/m1icZhyLp5bQ7tyrGQyEoItsS1gbI2F/C0+XiJoKcDP5jjsmWzVExEHaCZC9Tfqk/V+4yLvG+1aKVufa5R4nx4QZ/lK/aTgUQ7XiWq+dQjhtZ2LiZVrVaqfjZsAYB2yWl5FlibFcgMUM2oEuIdvGTt3hZvm6I7Ip9SCPruL5T0tPDq2NkOu0NYI7h++M9bqYcBBv7jQwkocyYDh0b90n9Q9gJ4MhCKOvmUfF0EfKSIgKiwFdND9vZc49aPK8I7hsjAV/pL/vxZ4JqvWxIY5zD2/pjuKl+gW9y+DyzNg4Z1eCwaF3blNsRWOlO2Ct4gZqgX9M8H7gRYZr+pP44aiaLpDdJBYDrQhuKfl/fxABcyK1in9nrXpM444WcYLI7TZd1jSlWGLnTDVbrPcrvnvnEql+RYcwM=";
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
interface TaskReminderDetails {
  dueDateTime?: DateTimeTimeZone;
  isReminderOn?: boolean;
  reminderDateTime?: DateTimeTimeZone;
}

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
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
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
): Promise<any> {
  console.log("Creating and sending meeting invite...");
  const eventBody = {
    ...eventDetails,
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
  };

  return await callGraphApi("/events", "POST", eventBody);
}

/**
 * 📅 Adds a personal event to the calendar (no invite sent).
 */
export async function addPersonalCalendarEvent(
  eventDetails: MeetingDetails,
): Promise<any> {
  console.log("Adding personal event to calendar...");
  return await callGraphApi("/events", "POST", eventDetails);
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
): Promise<{ message: string }> {
  console.log(`Replying to message ID: ${messageId}`);
  const body = {
    message: {
      comment: replyContent,
    },
  };
  return await callGraphApi(`/messages/${messageId}/reply`, "POST", body);
}

// ----------------------------------------------------------------------
// --- 3. Task/To Do Functions ---
// ----------------------------------------------------------------------

/**
 * ✅ Finds a task list by name. If it doesn't exist, it creates it.
 * @returns The ID of the task list.
 */
export async function getOrCreateTaskList(listName: string): Promise<string> {
  console.log(`Looking for or creating task list: "${listName}"`);

  // 1. Check if the list already exists
  const listsResponse = await callGraphApi<{
    value: { id: string; displayName: string }[];
  }>("/todo/lists", "GET");

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
  );
  console.log(`New list created with ID: ${newListResponse.id}`);
  return newListResponse.id;
}

/**
 * ✅ Adds a task/reminder to a dynamically fetched list.
 */
export async function addTaskOrReminder(
  title: string,
  reminderDetails: TaskReminderDetails = {},
  listName: string = "Jotly",
): Promise<any> {
  const listId = await getOrCreateTaskList(listName);
  console.log(`Adding task "${title}" to list ID: ${listId}`);

  const body = {
    title: title,
    ...reminderDetails,
  };

  return await callGraphApi(`/todo/lists/${listId}/tasks`, "POST", body);
}
