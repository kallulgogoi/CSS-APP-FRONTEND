import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <View className="items-center py-20 px-4">
      <LinearGradient
        colors={["#1e1b4b", "#0f172a"]}
        className="w-32 h-32 rounded-3xl items-center justify-center mb-6 border border-gray-800/50"
      >
        <Ionicons name="trophy-outline" size={64} color="#00d4ff" />
      </LinearGradient>
      <Text className="text-2xl font-bold text-white mb-2">
        No Active Events
      </Text>
      <Text className="text-gray-400 text-center text-lg mb-2">
        Check back soon for upcoming sports tournaments
      </Text>
      <Text className="text-cyan-400/60 text-center text-sm mb-6">
        Stay tuned for exciting matches!
      </Text>
      <TouchableOpacity
        onPress={onRefresh}
        className="px-8 py-3 bg-cyan-500/10 rounded-full border border-cyan-500/20"
      >
        <Text className="text-cyan-400 font-bold">Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};
