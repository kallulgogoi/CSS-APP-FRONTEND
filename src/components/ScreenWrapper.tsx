import React from "react";
import { SafeAreaView, View, StatusBar } from "react-native";

export const ScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaView className="flex-1 bg-tech-bg pt-20">
    <StatusBar barStyle="light-content" backgroundColor="#020617" />
    <View className="flex-1 px-4">{children}</View>
  </SafeAreaView>
);
