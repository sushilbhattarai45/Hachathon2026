import React from 'react';
import {  View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const onContinueWithOutlook = () => {


    // UI-only placeholder (no OAuth)
router.push('/screens/homeScreen');  };

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



