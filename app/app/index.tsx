import React, { useEffect, useState } from 'react';
import {  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { User } from 'lucide-react-native';
import { router } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();
import { getNewAccessToken } from '@/components/getNewToken';

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'exp',
});
  console.log('Redirect URI:', redirectUri);


const discovery = {
  authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  let azureClientId=process.env.EXPO_PUBLIC_AZURE_CLIENT_ID;
  if (!azureClientId) {
    console.error('EXPO_PUBLIC_AZURE_CLIENT_ID is not defined in environment variables.');
  }
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
    },
    discovery
  );
  

 
  const fetchToken = async (code: any) => {
    const body = new URLSearchParams({
      client_id: process.env.EXPO_PUBLIC_AZURE_CLIENT_ID!,
      scope: 'openid profile User.Read Mail.Read',
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: request?.codeVerifier || '',
    }).toString();

    try {
      const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      const data = await res.json();
      console.log('Token response:', data);
     
      setAccessToken(data.access_token);
      storeTokens(data);
    } catch (err) {
      console.error('Token exchange error:', err);
    }
  };

const  checkTokens = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const tokenExpiration = await SecureStore.getItemAsync('tokenExpiration');
    if (accessToken && tokenExpiration) {
      const expirationTime = parseInt(tokenExpiration, 10);
      if (Date.now() < expirationTime) {
       console.log("Token is valid, navigating to home screen");
        router.push('/screens/homeScreen');
      }
      else {
        console.log("Token expired, please log in again.");
     const token =  await getNewAccessToken()
if (token!==null){
  // router.push('/screens/homeScreen');
}

      }
    }
  };
useEffect(() => {
  checkTokens();
}, []);
 const storeTokens = async (data: any) => {
  const expirationTime = Date.now() + data.expires_in * 1000; // ms timestamp
  await SecureStore.setItemAsync('accessToken', data.access_token);
  await SecureStore.setItemAsync('refreshToken', data.refresh_token);
  await SecureStore.setItemAsync('tokenExpiration', expirationTime.toString());

};
  React.useEffect(() => {
    console.log("hi"+process.env.EXPO_PUBLIC_AZURE_CLIENT_ID);
    if(!accessToken)
    {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('Authorization code received:', code);
      fetchToken(code);
      setLoading(false);
    } else if (response?.type === 'error') {
      console.log('Auth error:', response.params.error);
      setLoading(false);
    }
  }
  }, [response, request?.codeVerifier]);

  const onContinueWithOutlook = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.log('Login error', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <User color="red" size={48}  style={{
            alignContent: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}
            />
          <Text style={{
            ...styles.appName,
            fontFamily: 'System',
            alignSelf: 'center',
            marginTop: 40,
          }}>Hachathon</Text>
          <Text style={{
            ...styles.tagline,
            
            fontFamily: 'System',
            alignSelf: 'center',

          }}>Smart events, smarter teams</Text>
        </View>

        <View style={styles.center}>
          {/* optional logo/illustration can go here */}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Continue with Outlook"
            activeOpacity={0.9}
            style={styles.outlookButton}
            onPress={onContinueWithOutlook}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>O</Text>
            </View>
            <Text style={styles.outlookText}>Continue with Outlook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { marginTop: 24 },
  appName: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  tagline: { marginTop: 6, color: '#475569', fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingBottom: 24 },
  outlookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0078D4',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { color: '#fff', fontWeight: '700' },
  outlookText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});



