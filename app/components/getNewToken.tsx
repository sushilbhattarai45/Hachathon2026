import * as SecureStore from 'expo-secure-store';

export const getNewAccessToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) throw new Error("No refresh token found");

  const body = new URLSearchParams({
    client_id: process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
    scope: 'openid profile User.Read Mail.Read offline_access',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }).toString();

  const res = await fetch(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  );

  const data = await res.json();
  console.log('New access token:', data.access_token);

  // Save new tokens
  await SecureStore.setItemAsync('accessToken', data.access_token);
  if (data.refresh_token) {
    await SecureStore.setItemAsync('refreshToken', data.refresh_token);
  }

  return data.access_token;
};
