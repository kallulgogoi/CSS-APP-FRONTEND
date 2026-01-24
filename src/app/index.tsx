import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
export default function Index() {
  const { isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Index Check -> isLoading:", isLoading, "| User:", user?.email);

    if (!isLoading) {
      if (user && user.scholarId) {
        console.log("User found & Onboarded -> Going Home");
        router.replace("/(tabs)/home");
      } else if (user && !user.scholarId) {
        console.log("User found but NO Scholar ID -> Going Onboarding");
        router.replace("/(auth)/onboarding");
      } else {
        console.log("No User -> Going Login");
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, user]);

  return (
    <View className="flex-1 bg-tech-bg justify-center items-center">
      <ActivityIndicator size="large" color="#06b6d4" />
      <Text className="text-white mt-4 font-bold">Initializing App...</Text>
    </View>
  );
}
