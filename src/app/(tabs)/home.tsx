import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState<string>("Good Morning");
  useFocusEffect(
    useCallback(() => {
      fetchData();
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    }, []),
  );

  const fetchData = async () => {
    try {
      const [eventsRes, userRes] = await Promise.all([
        api.get("/events"),
        api.get("/auth/me"),
      ]);

      setEvents(eventsRes.data);
      if (userRes.data) {
        updateUser(userRes.data);
      }
    } catch (error) {
      console.log("Error fetching data", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const shortName = (name: string) => {
    if (!name) return "User";
    if (name.length <= 10) return name;
    return name.slice(0, 10) + "...";
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#06b6d4"
          />
        }
      >
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <View>
            <Text className="text-tech-muted text-md font-bold tracking-widest uppercase mb-1">
              {greeting}
            </Text>
            <Text className="text-3xl font-extrabold text-white tracking-tight">
              {shortName(user?.name as any)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <View className="w-12 h-12 rounded-full border-2 border-tech-primary overflow-hidden bg-tech-card">
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-tech-bg">
                  <Text className="text-white font-bold text-lg">
                    {user?.name?.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-tech-primary/30">
          <LinearGradient
            colors={["#1e293b", "#0f172a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 border border-tech-border/50 relative"
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-tech-muted text-xs font-bold mb-2 tracking-widest">
                  CREDITS AVAILABLE
                </Text>
                <View className="flex-row items-baseline">
                  {/* Displays the dynamic user points */}
                  <Text className="text-5xl font-black text-white shadow-black drop-shadow-md">
                    {user?.points?.toLocaleString() || 0}
                  </Text>
                  <Text className="text-tech-primary font-bold text-lg ml-2">
                    PTS
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-white">Live Protocols</Text>
          <TouchableOpacity onPress={() => fetchData()}>
            <Ionicons name="refresh-circle" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {events.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Ionicons name="server-outline" size={48} color="#64748b" />
            <Text className="text-tech-muted italic mt-4">
              System Offline: No events found.
            </Text>
          </View>
        ) : (
          events.map((item: any) => (
            <TouchableOpacity
              key={item._id}
              activeOpacity={0.9}
              onPress={() => router.push(`/event/${item._id}` as any)}
              className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-tech-border/30 bg-tech-card"
            >
              <View className="h-40 relative">
                <Image
                  source={{ uri: item.bannerImageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.9)"]}
                  className="absolute left-0 right-0 bottom-0 h-24"
                />

                {item.isActive && (
                  <View className="absolute top-3 right-3 bg-red-600/90 px-3 py-1 rounded-full flex-row items-center border border-red-400">
                    <View className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                    <Text className="text-white text-[10px] font-bold">
                      LIVE
                    </Text>
                  </View>
                )}

                <View className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                  <Text className="text-tech-primary text-[10px] font-bold uppercase">
                    {item.sport}
                  </Text>
                </View>
              </View>

              <View className="p-4 bg-tech-card">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                    <Text className="text-white text-xl font-bold leading-tight mb-1">
                      {item.name}
                    </Text>
                    <Text className="text-tech-muted text-xs">
                      {item.type} Edition • Priority Access
                    </Text>
                  </View>
                  <View className="bg-tech-bg rounded-lg p-2 items-center justify-center border border-tech-border">
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
