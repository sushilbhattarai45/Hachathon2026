

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, Circle } from 'lucide-react-native';
import axios from 'axios';

import * as SecureStore from 'expo-secure-store';
interface Category {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  { id: 'reminders', label: 'Reminders', description: 'Important reminders & notifications', icon: '🔔' },
  { id: 'deadlines', label: 'Deadlines', description: 'Project deadlines & due dates', icon: '⏰' },
  { id: 'discounts', label: 'Discounts', description: 'Special offers & discounts', icon: '🏷️' },
  { id: 'promotional', label: 'Promotional', description: 'Promotional emails & deals', icon: '📢' },
  { id: 'events', label: 'Events', description: 'Calendar events & meetings', icon: '📅' },
  { id: 'internship', label: 'Internships', description: 'Internship opportunities & programs', icon: '💼' },
];

export default function OnBoardingScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleContinue =async () => {
    console.log('Selected categories:', selected);
    let email = await SecureStore.getItemAsync('userEmail');
    // Store selected categories (can be saved to AsyncStorage or passed to parent)
    let resposne = await axios.post(process.env.EXPO_PUBLIC_API_URL+"/user/updateTags",{
      email :'shyamm@gmail.com',
      tags :selected
    })

if (resposne.status === 200) {
    console.log("Tags updated successfully");
    router.push("/screens/homeScreen");
  };

}
  const allSelected = selected.length > 0;

  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal: 24,
    },
    scrollContent: {
      paddingTop: 32,
      paddingBottom: 140,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 32,
    },
    welcomeText: {
      fontSize: 36,
      fontWeight: '800',
      color: '#0f172a',
      marginBottom: 10,
      letterSpacing: -0.8,
    },
    descriptionText: {
      fontSize: 15,
      color: '#64748b',
      lineHeight: 24,
      fontWeight: '500',
    },
    subtitleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    subtitleText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0f172a',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    subtitleCount: {
      fontSize: 13,
      fontWeight: '600',
      color: '#0078D4',
      backgroundColor: '#dbeafe',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
    },
    categoriesContainer: {
      gap: 12,
    },
    categoryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: '#f8fafc',
      borderWidth: 1.5,
      borderColor: '#e2e8f0',
    },
    categoryCardSelected: {
      backgroundColor: '#dbeafe',
      borderColor: '#0078D4',
      borderWidth: 2,
    },
    checkboxContainer: {
      marginRight: 14,
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
    },
    categoryContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    categoryIcon: {
      fontSize: 32,
      width: 44,
      height: 44,
      textAlignVertical: 'center',
      textAlign: 'center',
    },
    categoryText: {
      flex: 1,
    },
    categoryLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    categoryDescription: {
      fontSize: 13,
      color: '#94a3b8',
      fontWeight: '500',
      lineHeight: 18,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingVertical: 24,
      paddingBottom: 32,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: '#0078D4',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#0078D4',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonDisabled: {
      backgroundColor: '#cbd5e1',
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Smart Events</Text>
          <Text style={styles.descriptionText}>
            Choose what matters to you and we'll keep you in sync
          </Text>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Select your interests</Text>
          <Text style={styles.subtitleCount}>{selected.length} of {CATEGORIES.length}</Text>
        </View>

        <View style={styles.categoriesContainer}>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selected.includes(category.id) && styles.categoryCardSelected,
              ]}
              onPress={() => toggleCategory(category.id)}
              activeOpacity={0.75}
            >
              <View style={styles.checkboxContainer}>
                {selected.includes(category.id) ? (
                  <CheckCircle2 color="#0078D4" size={24} strokeWidth={2.5} />
                ) : (
                  <Circle color="#cbd5e1" size={24} strokeWidth={2} />
                )}
              </View>
              
              <View style={styles.categoryContent}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryText}>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !allSelected && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allSelected}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>
            {allSelected ? `Continue (${selected.length} selected)` : 'Select at least one'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}