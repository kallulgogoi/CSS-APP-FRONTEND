import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { TechButton } from "../../components/TechButton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import "../../../global.css";
export default function Login() {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center">
        <Text className="text-5xl font-extrabold text-white">
          CSS <Text className="text-tech-primary">NITS</Text>
        </Text>
        <Text className="text-tech-muted text-center mb-12">
          Sports Protocol
        </Text>
        <TechButton
          title="AUTHENTICATE"
          onPress={signInWithGoogle}
          loading={isLoading}
        />
      </View>
    </ScreenWrapper>
  );
}
