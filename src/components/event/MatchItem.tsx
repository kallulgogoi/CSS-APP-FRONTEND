import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export const MatchItem = ({ item }: { item: any }) => {
  const router = useRouter();

  const formatMatchTime = (isoString: string) => {
    if (!isoString) return { date: "TBD", time: "" };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = formatMatchTime(item.startTime);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/match/${item._id}`)}
      className={`bg-tech-card p-4 mb-3 rounded-xl border border-tech-border ${item.status !== "UPCOMING" ? "opacity-80" : ""}`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View
          className={`px-2 py-0.5 rounded border ${
            item.status === "LIVE"
              ? "bg-green-500/20 border-green-500"
              : item.status === "COMPLETED"
                ? "bg-red-500/20 border-red-500"
                : "bg-tech-primary/20 border-tech-primary"
          }`}
        >
          <Text
            className={`text-[10px] font-bold ${
              item.status === "LIVE"
                ? "text-green-400"
                : item.status === "COMPLETED"
                  ? "text-red-400"
                  : "text-tech-primary"
            }`}
          >
            {item.status}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text className="text-tech-muted text-xs font-bold ml-1">
            {date} • {time}
          </Text>
        </View>
      </View>

      {/* Teams */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1 items-start">
          <Text className="text-white font-bold text-lg" numberOfLines={1}>
            {item.teamA?.name}
          </Text>
        </View>
        <View className="bg-tech-bg px-3 py-1 rounded-full border border-tech-primary mx-2">
          <Text className="text-tech-primary font-bold text-xs">VS</Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-white font-bold text-lg" numberOfLines={1}>
            {item.teamB?.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
