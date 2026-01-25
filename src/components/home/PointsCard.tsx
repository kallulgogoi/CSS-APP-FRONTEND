import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const PointsCard = ({ user }: { user: any }) => {
  return (
    <LinearGradient
      colors={["#0f172a", "#1e1b4b"]}
      className="rounded-3xl overflow-hidden mb-8 border border-gray-800/50"
    >
      <View className="p-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="flash" size={20} color="#00d4ff" />
            <Text className="text-cyan-400 text-sm font-bold tracking-widest uppercase">
              SPORTS CREDITS
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2 items-end">
          <Text className="text-6xl font-black text-white tracking-tighter">
            {user?.points?.toLocaleString() ?? "0"}
          </Text>
          <Text className="text-2xl font-bold mb-1 text-cyan-400">PTS</Text>
        </View>
      </View>
    </LinearGradient>
  );
};
