import React, { useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Call this when your existing button is clicked
  const handleSignInAndLoad = async () => {
    setError(null);
    try {
      // 1) Login (popup) - MSAL handles PKCE
      await instance.loginPopup(loginRequest);

      // 2) Acquire token - silent preferred, fallback to popup
      const account = instance.getAllAccounts()[0];
      if (!account) throw new Error("No signed-in account found");

      let tokenResponse;
      try {
        tokenResponse = await instance.acquireTokenSilent({
          scopes: loginRequest.scopes,
          account,
        });
      } catch (silentError) {
        // fallback
        tokenResponse = await instance.acquireTokenPopup({
          scopes: loginRequest.scopes,
        });
      }

      const accessToken = tokenResponse.accessToken;
      if (!accessToken) throw new Error("Failed to acquire access token");
console.log(accessToken)
      // 3) Call Microsoft Graph to read messages
      setLoading(true);
      const res = await fetch("https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages?$top=10&$select=subject,from,bodyPreview,receivedDateTime", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });


      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Graph error: ${res.status} ${text}`);
      }

      const data = await res.json();
      setEmails(data.value || []);
      console.log(data)
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await instance.logoutPopup();
      setEmails([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Outlook Dashboard</h1>

      {!isAuthenticated ? (
        <button onClick={handleSignInAndLoad}>Sign in with Microsoft & Load Inbox</button>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <button onClick={handleSignOut}>Sign out</button>{" "}
            <button onClick={handleSignInAndLoad}>Reload Inbox</button>
          </div>

          {loading && <div>Loading emails...</div>}
          {error && <div style={{ color: "red" }}>Error: {error}</div>}

          <ul>
            {emails.map((m) => (
              <li key={m.id} style={{ marginBottom: 12 }}>
                <strong>{m.subject || "(no subject)"}</strong>
                <div>From: {m.from?.emailAddress?.name || m.from?.emailAddress?.address}</div>
                <div style={{ color: "#444" }}>{m.bodyPreview}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
