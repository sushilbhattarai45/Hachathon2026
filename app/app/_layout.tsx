import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {View, Text} from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import ToastManager, { Toast } from 'toastify-react-native'

export const unstable_settings = {
  anchor: "(tabs)",
};

const toastConfig = {
  success: (props: any) => (
    <View style={{ backgroundColor: "#4CAF50", padding: 16, borderRadius: 10 }}>
      <Text style={{ color: "white", fontWeight: "bold" }}>{props.text1}</Text>
      {props.text2 && <Text style={{ color: "white" }}>{props.text2}</Text>}
    </View>
  ),
  // Override other toast types as needed
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen
          name="screens/onBoardingScreen"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="screens/homeScreen"
          options={{ headerShown: false }}
        />
      </Stack>
      <ToastManager config={toastConfig} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
