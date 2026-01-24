import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
// Standard import is better for Expo
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* 1. Header Section */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-tech-muted text-xs font-bold tracking-wider">
              WELCOME BACK
            </Text>
            <Text className="text-2xl font-bold text-white">{user?.name}</Text>
          </View>
        </View>

        <View className="bg-tech-card p-6 rounded-2xl border border-tech-border mb-8 relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-32 h-32 bg-tech-primary/10 rounded-full" />
          <Text className="text-tech-muted text-xs font-bold mb-1">
            AVAILABLE BALANCE
          </Text>
          <Text className="text-4xl font-extrabold text-tech-accent">
            {user?.points} <Text className="text-lg text-white">PTS</Text>
          </Text>
        </View>

        {/* Events Section */}
        <Text className="text-xl font-bold text-white mb-4">Active Events</Text>

        {events.length === 0 ? (
          <Text className="text-tech-muted italic mb-6">
            No active events found.
          </Text>
        ) : (
          events.map((item: any) => (
            <TouchableOpacity
              key={item._id}
              activeOpacity={0.8}
              onPress={() => router.push(`/event/${item._id}`)}
              className="bg-tech-card mb-4 rounded-xl border border-tech-border overflow-hidden"
            >
              <Image
                source={{ uri: item.bannerImageUrl }}
                className="w-full h-32 opacity-80"
                resizeMode="cover"
              />
              <View className="p-4">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-tech-primary text-xs font-bold uppercase tracking-wider">
                    {item.sport} • {item.type}
                  </Text>
                  {item.isActive && (
                    <View className="bg-green-500/20 px-2 py-1 rounded">
                      <Text className="text-green-400 text-[10px] font-bold">
                        LIVE
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-white text-lg font-bold">
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
