import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  iconName: any;
  colors: [string, string, ...string[]];
}

export const SectionHeader = ({
  title,
  subtitle,
  iconName,
  colors,
}: SectionHeaderProps) => {
  return (
    <View className="px-4 mb-6">
      <View className="flex-row items-center gap-3">
        <LinearGradient
          colors={colors}
          className="w-12 h-12 rounded-full items-center justify-center"
        >
          <Ionicons name={iconName} size={24} color="white" />
        </LinearGradient>
        <View>
          <Text className="text-2xl font-black text-white">{title}</Text>
          <Text className="text-gray-400 text-sm">{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};
