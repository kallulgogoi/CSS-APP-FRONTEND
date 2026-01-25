import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export const VerticalEventCard = ({ item }: { item: any }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/event/${item._id}`)}
      className="mb-6 rounded-3xl overflow-hidden border border-gray-800/50 bg-gray-900/50"
    >
      <View className="relative h-56">
        <Image
          source={{ uri: item.bannerImageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.95)"]}
          className="absolute inset-0"
        />

        {/* Tech grid overlay */}
        <View className="absolute inset-0 opacity-10">
          <View className="flex-1 border border-gray-700/30 m-4 rounded-2xl" />
        </View>

        <View className="absolute top-5 left-5">
          <LinearGradient
            colors={["#00d4ff", "#3b82f6"]}
            className="px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-sm font-bold uppercase tracking-wider">
              {item.sport}
            </Text>
          </LinearGradient>
        </View>

        {/* Stats overlay */}
        {item.isActive && (
          <View className="absolute bottom-5 right-5">
            <View className="px-3 py-2 rounded-lg bg-black/60 border border-gray-800/50">
              <View className="flex-row items-center space-x-2">
                <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <Text className="text-white text-sm font-bold">LIVE</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className="p-6 bg-gray-900/50">
        <Text className="text-white text-2xl font-bold leading-tight mb-3">
          {item.name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 font-medium uppercase tracking-wider">
            {item.type}
          </Text>
          <LinearGradient
            colors={["#00d4ff", "#3b82f6"]}
            start={[0, 0]}
            end={[1, 1]}
            className="px-4 py-2 rounded-full"
          >
            <Text className="text-white font-bold text-sm">VIEW DETAILS</Text>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
};
