import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export const HorizontalEventCard = ({ item }: { item: any }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/event/${item._id}`)}
      className="mr-4 rounded-3xl overflow-hidden w-80 bg-gray-900/80 border border-gray-800/50"
    >
      <View className="relative h-48">
        <Image
          source={{ uri: item.bannerImageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.95)"]}
          locations={[0.4, 1]}
          className="absolute inset-0"
        />

        {/* Tech overlay */}
        <View className="absolute inset-0">
          <View className="absolute top-0 left-0 w-20 h-20">
            <LinearGradient
              colors={["rgba(0,212,255,0.15)", "transparent"]}
              start={[0, 0]}
              end={[1, 1]}
              className="w-full h-full"
            />
          </View>
          <View className="absolute bottom-0 right-0 w-32 h-32">
            <LinearGradient
              colors={["rgba(124,58,237,0.1)", "transparent"]}
              start={[1, 0]}
              end={[0, 1]}
              className="w-full h-full"
            />
          </View>
        </View>

        {/* Live indicator */}
        {item.isActive && (
          <View className="absolute top-4 right-4">
            <LinearGradient
              colors={["#FF1E1E", "#FF6B6B"]}
              start={[0, 0]}
              end={[1, 1]}
              className="px-4 py-2 rounded-full flex-row items-center space-x-2 shadow-lg shadow-red-500/30"
            >
              <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <Text className="text-white text-xs font-bold tracking-widest">
                LIVE
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Sport badge */}
        <View className="absolute bottom-4 left-4">
          <View className="px-3 py-2 rounded-xl bg-black/60 border border-gray-800/50">
            <Text className="text-cyan-300 text-sm font-bold uppercase tracking-wider">
              {item.sport}
            </Text>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={["#111827", "#0f172a"]}
        className="p-6 border-t border-gray-800/50"
      >
        <Text
          numberOfLines={2}
          className="text-white text-xl font-bold leading-tight mb-2"
        >
          {item.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            {item.type}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="flash-outline" size={14} color="#00d4ff" />
            <Text className="text-cyan-400 text-xs font-bold ml-1">
              JOIN NOW
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
