import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/useAuth";
import { StatusBar } from "expo-status-bar";
import "../../global.css";
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Slot />
    </AuthProvider>
  );
}
