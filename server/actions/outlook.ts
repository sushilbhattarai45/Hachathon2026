import fetch from "node-fetch";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// Helper function for Microsoft Graph requests
async function graphRequest(
  token: string,
  endpoint: string,
  method: string,
  body?: any,
) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : "",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph API Error: ${err}`);
  }

  return res.json();
}

export async function sendEmail(
  token: string,
  data: { to: string; subject: string; body: string },
) {
  const mail = {
    message: {
      subject: data.subject,
      body: {
        contentType: "HTML",
        content: data.body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: data.to,
          },
        },
      ],
    },
    saveToSentItems: true,
  };

  return graphRequest(token, "/me/sendMail", "POST", mail);
}

// 2️⃣ SCHEDULE EVENT
export async function scheduleEvent(
  token: string,
  data: {
    subject: string;
    body: string;
    start: string; // ISO
    end: string; // ISO
    attendees: string[];
  },
) {
  const event = {
    subject: data.subject,
    body: {
      contentType: "HTML",
      content: data.body,
    },
    start: {
      dateTime: data.start,
      timeZone: "UTC",
    },
    end: {
      dateTime: data.end,
      timeZone: "UTC",
    },
    attendees: data.attendees.map((email) => ({
      emailAddress: { address: email },
      type: "required",
    })),
  };

  return graphRequest(token, "/me/events", "POST", event);
}

// 3️⃣ RSVP TO EVENT
export async function sendRSVP(
  token: string,
  eventId: string,
  response: "accept" | "decline" | "tentative",
) {
  const endpointMap = {
    accept: "accept",
    decline: "decline",
    tentative: "tentativelyAccept",
  };

  const endpoint = endpointMap[response];

  return graphRequest(token, `/me/events/${eventId}/${endpoint}`, "POST", {
    comment: "Responding via API",
  });
}
