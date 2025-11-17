export const msalConfig = {
  auth: {
    clientId: 'd445a238-a3c5-4f8f-9f76-1299f33e7048', // from Azure portal
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'Mail.Read'],
};
