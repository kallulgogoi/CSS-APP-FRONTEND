import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/useAuth";
import { StatusBar } from "expo-status-bar";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import "../../global.css";

// Suppress reanimated warnings
configureReanimatedLogger({
  strict: false,
  level: ReanimatedLogLevel.warn,
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Slot />
    </AuthProvider>
  );
}
