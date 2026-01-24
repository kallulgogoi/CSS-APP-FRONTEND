import React from "react";
import { View, Text, Image } from "react-native";

export const EventHeader = ({ event }: { event: any }) => {
  if (!event) return null;
  return (
    <View className="mb-6">
      <View className="h-48 w-full rounded-2xl overflow-hidden border border-tech-border mb-4 relative">
        <Image
          source={{ uri: event.bannerImageUrl }}
          className="w-full h-full opacity-90"
          resizeMode="cover"
        />
        <View className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded">
          <Text className="text-tech-primary font-bold text-xs">
            {event.sport}
          </Text>
        </View>
      </View>
      <Text className="text-3xl font-extrabold text-white mb-1">
        {event.name}
      </Text>
      <View className="flex-row gap-2 mb-4">
        <View className="bg-tech-card px-2 py-1 rounded border border-tech-border">
          <Text className="text-tech-muted text-xs font-bold">
            {event.type}
          </Text>
        </View>
        {event.isActive && event.registrationOpen ? (
          <View className="bg-green-500/20 px-2 py-1 rounded">
            <Text className="text-green-400 text-xs font-bold">OPEN</Text>
          </View>
        ) : (
          <View className="bg-red-500/20 px-2 py-1 rounded">
            <Text className="text-red-400 text-xs font-bold">CLOSED</Text>
          </View>
        )}
      </View>
      <View className="bg-tech-card p-4 rounded-xl border border-tech-border mb-6">
        <Text className="text-tech-muted text-xs font-bold mb-2 uppercase">
          Rules
        </Text>
        <Text className="text-gray-300 leading-5">
          {event.rules || "No specific rules."}
        </Text>
      </View>
      <Text className="text-white text-xl font-bold mb-2">Match Schedule</Text>
    </View>
  );
};
