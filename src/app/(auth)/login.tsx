import React from "react";
import { View, Text, Image } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { TechButton } from "../../components/TechButton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import "../../../global.css";
import { imagePath } from "@/src/components/imagePath/images";
export default function Login() {
  const { signInWithGoogle, isLoading } = useAuth();
  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center items-center">
        <View className="flex-col items-center mb-20">
          <Image source={imagePath.logo} className="w-60 h-60 mb-8" />
          <Text className="text-5xl font-extrabold text-white">
            CSS <Text className="text-tech-primary">OLYMPICS</Text>
          </Text>
          <Image
            source={imagePath.olympicsLogo}
            className="w-20 h-20 inline-block"
            resizeMode="contain"
          />
        </View>
        <TechButton
          title="AUTHENTICATE"
          onPress={signInWithGoogle}
          loading={isLoading}
        />
      </View>
    </ScreenWrapper>
  );
}
