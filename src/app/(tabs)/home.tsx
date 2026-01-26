import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  TextInput,
  FlatList,
  Animated,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

import { HorizontalEventCard } from "../../components/home/HorizontalEventCard";
import { VerticalEventCard } from "../../components/home/VerticalEventCard";
import { PointsCard } from "../../components/home/PointsCard";
import { SectionHeader } from "../../components/home/SectionHeader";
import { EmptyState } from "../../components/home/EmptyState";
import { MatchItem } from "../../components/event/MatchItem";

export default function Home() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState<string>("Good Morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollY] = useState(new Animated.Value(0));
  const [unreadCount, setUnreadCount] = useState(0);

  // New State for Match Stats
  const [matchStatsMap, setMatchStatsMap] = useState<{ [key: string]: any }>(
    {},
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchInitialData = async () => {
        try {
          const hour = new Date().getHours();
          let newGreeting = "Good Morning";
          if (hour >= 12 && hour < 18) newGreeting = "Good Afternoon";
          else if (hour >= 18) newGreeting = "Good Evening";
          if (isActive) setGreeting(newGreeting);

          const [eventsRes, userRes, notifRes] = await Promise.all([
            api.get("/events"),
            api.get("/auth/me"),
            api.get("/notifications/my"),
          ]);

          if (isActive) {
            const fetchedEvents = eventsRes.data;
            setEvents(fetchedEvents);
            if (userRes.data) updateUser(userRes.data);

            const unread = (notifRes.data || []).filter(
              (n: any) => !n.read,
            ).length;
            setUnreadCount(unread);

            const eventIdsToCheck = fetchedEvents
              .map((e: any) => e._id)
              .slice(0, 5);

            if (eventIdsToCheck.length > 0) {
              const matchPromises = eventIdsToCheck.map((id: string) =>
                api.get(`/match/event/${id}`),
              );

              const matchesResponses = await Promise.all(matchPromises);
              const allMatches = matchesResponses.flatMap((res) => res.data);

              const relevantMatches = allMatches
                .filter(
                  (m: any) => m.status === "LIVE" || m.status === "UPCOMING",
                )
                .sort((a: any, b: any) => {
                  if (a.status === "LIVE" && b.status !== "LIVE") return -1;
                  if (b.status === "LIVE" && a.status !== "LIVE") return 1;
                  return (
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime()
                  );
                });

              setLiveMatches(relevantMatches);

              //Fetch Stats for these matches
              const stats: any = {};
              await Promise.all(
                relevantMatches.slice(0, 10).map(async (m: any) => {
                  try {
                    const { data } = await api.get(
                      `/investment/match/${m._id}/stats`,
                    );
                    stats[m._id] = data;
                  } catch (e) {
                    console.log(`Failed stats for ${m._id}`);
                  }
                }),
              );
              setMatchStatsMap(stats);
            }
          }
        } catch (error) {
          console.log("Error fetching data", error);
        } finally {
          if (isActive) setRefreshing(false);
        }
      };

      fetchInitialData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [eventsRes, userRes, notifRes] = await Promise.all([
        api.get("/events"),
        api.get("/auth/me"),
        api.get("/notifications/my"),
      ]);

      const fetchedEvents = eventsRes.data;
      setEvents(fetchedEvents);
      if (userRes.data) updateUser(userRes.data);

      const unread = (notifRes.data || []).filter((n: any) => !n.read).length;
      setUnreadCount(unread);

      const activeEventIds = fetchedEvents
        .filter((e: any) => e.isActive)
        .map((e: any) => e._id)
        .slice(0, 3);

      if (activeEventIds.length > 0) {
        const matchesResponses = await Promise.all(
          activeEventIds.map((id: string) => api.get(`/match/event/${id}`)),
        );
        const allMatches = matchesResponses.flatMap((res) => res.data);
        const relevantMatches = allMatches.filter(
          (m: any) => m.status === "LIVE" || m.status === "UPCOMING",
        );
        setLiveMatches(relevantMatches);

        // 3. Update Stats on Refresh
        const stats: any = {};
        await Promise.all(
          relevantMatches.slice(0, 10).map(async (m: any) => {
            try {
              const { data } = await api.get(
                `/investment/match/${m._id}/stats`,
              );
              stats[m._id] = data;
            } catch (e) {}
          }),
        );
        setMatchStatsMap(stats);
      }
    } catch (error) {
      console.log("Error refreshing", error);
    } finally {
      setRefreshing(false);
    }
  };

  const shortName = (name?: string) => {
    if (!name) return "Athlete";
    return name.length > 8 ? name.slice(0, 8) + "..." : name;
  };

  const filteredEvents = events.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const cricketEvents = events.filter(
    (item: any) => item.sport?.toLowerCase() === "cricket",
  );
  const badmintonEvents = events.filter(
    (item: any) => item.sport?.toLowerCase() === "badminton",
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00d4ff"
            colors={["#00d4ff", "#3b82f6"]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View className="px-4 -mt-2 ">
          <View className="flex-row justify-between items-center py-3">
            <View>
              <Text className="text-gray-400 text-md font-medium tracking-widest uppercase">
                {greeting}
              </Text>
              <Text className="text-3xl font-black text-white mt-2 tracking-tight">
                {shortName(user?.name)}
              </Text>
            </View>

            {/* Notification & Profile */}
            <View className="flex-row items-center gap-3">
              {/* Notification Button with Badge */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/notifications" as any)}
                className="h-12 w-12 rounded-full bg-gray-800 border border-gray-700 items-center justify-center relative"
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="white"
                />

                {unreadCount > 0 && (
                  <View className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full items-center justify-center border border-gray-800">
                    <Text className="text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <PointsCard user={user} />

          <View className="mb-8">
            <View className="rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800/50">
              <View className="flex-row items-center h-16 px-5">
                <Ionicons name="search" size={22} color="#00d4ff" />
                <TextInput
                  placeholder="Search events, sports..."
                  placeholderTextColor="#6b7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-4 text-white font-medium text-lg h-full"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={22} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {searchQuery.length > 0 ? (
          <View className="px-4">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-2xl font-black text-white">
                  Search Results
                </Text>
                <Text className="text-gray-400 mt-1">
                  {filteredEvents.length} events found
                </Text>
              </View>
            </View>
            {filteredEvents.map((item: any) => (
              <VerticalEventCard key={item._id} item={item} />
            ))}
          </View>
        ) : (
          <>
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4 px-1">
                <View className="flex-row items-center">
                  <View className="bg-red-500/10 p-2 rounded-full mr-2">
                    <Ionicons name="trophy" size={18} color="#ef4444" />
                  </View>
                  <View>
                    <Text className="text-xl font-black text-white tracking-tight">
                      Match Center
                    </Text>
                    <Text className="text-neutral-400 text-xs">
                      {liveMatches.length > 0
                        ? "Live & Upcoming"
                        : "Scores & Results"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/matches" as any)}
                >
                  <Text className="text-cyan-400 font-bold text-sm">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {liveMatches.length > 0 ? (
                <FlatList
                  horizontal
                  data={liveMatches.slice(0, 4)}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <View className="w-80 mr-4">
                      {/* 4. Pass matchStats to MatchItem */}
                      <MatchItem
                        item={item}
                        matchStats={matchStatsMap[item._id]}
                      />
                    </View>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => router.push("/matches" as any)}
                  activeOpacity={0.7}
                  className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 border-dashed items-center justify-center mx-4"
                >
                  <Ionicons name="calendar-outline" size={32} color="#525252" />
                  <Text className="text-neutral-400 font-bold mt-2">
                    No live matches right now
                  </Text>
                  <Text className="text-cyan-500 text-xs font-bold mt-1">
                    Tap to view full schedule & results
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {cricketEvents.length > 0 && (
              <View className="mb-10">
                <SectionHeader
                  title="Cricket Fever"
                  subtitle="Tournaments & Leagues"
                  iconName="baseball"
                  colors={["#f59e0b", "#d97706"]}
                />
                <FlatList
                  horizontal
                  data={cricketEvents}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => <HorizontalEventCard item={item} />}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              </View>
            )}

            {badmintonEvents.length > 0 && (
              <View className="mb-10">
                <SectionHeader
                  title="Badminton Smash"
                  subtitle="Court battles"
                  iconName="tennisball"
                  colors={["#8b5cf6", "#7c3aed"]}
                />
                <FlatList
                  horizontal
                  data={badmintonEvents}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => <HorizontalEventCard item={item} />}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                />
              </View>
            )}

            {cricketEvents.length === 0 && badmintonEvents.length === 0 && (
              <EmptyState onRefresh={onRefresh} />
            )}
          </>
        )}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
    </ScreenWrapper>
  );
}
