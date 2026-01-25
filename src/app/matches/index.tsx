import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../constants";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { MatchItem } from "../../components/event/MatchItem";

const ROUND_ORDER = [
  "NONE",
  "QUALIFIERS",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "FINALS",
  "CHAMPION",
];

const formatRoundName = (round: string) => {
  switch (round) {
    case "NONE":
      return "General Matches";
    case "QUALIFIERS":
      return "Qualifiers";
    case "QUARTER_FINALS":
      return "Quarter Finals";
    case "SEMI_FINALS":
      return "Semi Finals";
    case "FINALS":
      return "Grand Final";
    case "CHAMPION":
      return "Champion's Circle";
    default:
      return round;
  }
};

export default function AllMatchesScreen() {
  const router = useRouter();

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<string>("QUALIFIERS");
  const [availableRounds, setAvailableRounds] = useState<string[]>([]);
  const [statsMap, setStatsMap] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchAllMatches();
  }, []);

  const fetchAllMatches = async () => {
    try {
      setLoading(true);

      const eventsRes = await api.get("/events");
      const activeEvents = eventsRes.data.filter((e: any) => e.isActive);

      const matchPromises = activeEvents.map((e: any) =>
        api.get(`/match/event/${e._id}`),
      );

      const responses = await Promise.all(matchPromises);
      const allMatches = responses.flatMap((res) => res.data);

      const sortedMatches = allMatches.sort((a: any, b: any) => {
        const getPriority = (status: string) => {
          if (status === "LIVE") return 0;
          if (status === "UPCOMING") return 1;
          return 2;
        };

        const priorityA = getPriority(a.status);
        const priorityB = getPriority(b.status);

        if (priorityA !== priorityB) return priorityA - priorityB;

        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();

        // For UPCOMING, show soonest first (Ascending)
        if (a.status === "UPCOMING") {
          return timeA - timeB;
        }

        // For LIVE and COMPLETED, show most recent/latest first (Descending)
        return timeB - timeA;
      });

      setMatches(sortedMatches);

      const rounds = [
        ...new Set(sortedMatches.map((m: any) => m.round || "NONE")),
      ];

      const sortedRounds = rounds.sort(
        (a: any, b: any) => ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b),
      );

      setAvailableRounds(sortedRounds as string[]);

      if (sortedRounds.length > 0 && !sortedRounds.includes(selectedRound)) {
        setSelectedRound(sortedRounds[0] as string);
      }

      const stats: any = {};
      await Promise.all(
        sortedMatches.slice(0, 20).map(async (m: any) => {
          try {
            const { data } = await api.get(`/investment/match/${m._id}/stats`);
            stats[m._id] = data;
          } catch (e) {}
        }),
      );
      setStatsMap(stats);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(
    (m) => (m.round || "NONE") === selectedRound,
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View className="flex-1 px-4">
        <View className="flex-row items-center py-4 mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-neutral-800 p-2 rounded-full mr-4 border border-neutral-700"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-bold text-xl">Match Center</Text>
            <Text className="text-neutral-400 text-xs">
              All active tournaments
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00d4ff" />
          </View>
        ) : (
          <>
            <View className="mb-6 h-10">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {availableRounds.length > 0 ? (
                  availableRounds.map((round) => {
                    const isActive = selectedRound === round;
                    return (
                      <TouchableOpacity
                        key={round}
                        onPress={() => setSelectedRound(round)}
                        className={`mr-3 px-5 py-2 rounded-full border flex-row items-center ${
                          isActive
                            ? "bg-tech-primary border-tech-primary"
                            : "bg-neutral-900 border-neutral-800"
                        }`}
                      >
                        <Text
                          className={`font-bold text-xs ${
                            isActive ? "text-black" : "text-neutral-400"
                          }`}
                        >
                          {formatRoundName(round)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text className="text-neutral-500 italic mt-2 ml-2">
                    No matches found
                  </Text>
                )}
              </ScrollView>
            </View>

            <FlatList
              data={filteredMatches}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}
              ListEmptyComponent={
                <View className="items-center justify-center py-20 opacity-50">
                  <Ionicons name="file-tray-outline" size={64} color="#666" />
                  <Text className="text-neutral-400 mt-4 font-medium text-center">
                    No matches scheduled for{"\n"}
                    {formatRoundName(selectedRound)}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <MatchItem
                  item={item}
                  matchStats={statsMap[item._id] ? [statsMap[item._id]] : []}
                />
              )}
            />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}
