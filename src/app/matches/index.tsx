import React, { useState, useEffect, useMemo } from "react";
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
      return "League / Group";
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

  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New State for User Bets
  const [myBets, setMyBets] = useState<any[]>([]);

  // Filters
  const [selectedSport, setSelectedSport] = useState<string>("ALL");
  const [selectedRound, setSelectedRound] = useState<string>("");

  // Derived Lists
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [statsMap, setStatsMap] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Events AND My Investments
      const [eventsRes, myInvestRes] = await Promise.all([
        api.get("/events"),
        api.get("/investment/my"), // Fetch user bets
      ]);

      setMyBets(myInvestRes.data);

      const activeEvents = eventsRes.data.filter((e: any) => e.isActive);

      // Get all sports
      const sports = ["ALL", ...new Set(activeEvents.map((e: any) => e.sport))];
      setAvailableSports(sports as string[]);

      const matchPromises = activeEvents.map((e: any) =>
        api.get(`/match/event/${e._id}`),
      );

      const responses = await Promise.all(matchPromises);
      const fetchedMatches = responses.flatMap((res) => res.data);

      // Sort matches
      const sortedMatches = fetchedMatches.sort((a: any, b: any) => {
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

        if (a.status === "UPCOMING") return timeA - timeB;
        return timeB - timeA;
      });

      setAllMatches(sortedMatches);

      // Fetch stats for top matches
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

  // --- Helpers for Stats ---
  const getMatchTotalPool = (matchId: string) => {
    const stats = statsMap[matchId];
    if (!stats || !Array.isArray(stats)) return 0;
    return stats.reduce(
      (acc: number, curr: any) => acc + (curr.totalPoints || 0),
      0,
    );
  };

  const getMyInvestedAmount = (matchId: string) => {
    // Filter all bets I made on this match (handles multiple bets)
    const bets = myBets.filter(
      (b: any) => b.match === matchId || b.match?._id === matchId,
    );
    return bets.reduce((acc, curr) => acc + (curr.pointsInvested || 0), 0);
  };

  // --- Filters ---
  const matchesBySport = useMemo(() => {
    if (selectedSport === "ALL") return allMatches;
    return allMatches.filter((m) => m.event?.sport === selectedSport);
  }, [selectedSport, allMatches]);

  const availableRounds = useMemo(() => {
    const rounds = [
      ...new Set(matchesBySport.map((m: any) => m.round || "NONE")),
    ];
    return rounds.sort(
      (a: any, b: any) => ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b),
    );
  }, [matchesBySport]);

  useEffect(() => {
    if (availableRounds.length > 0) {
      if (!selectedRound || !availableRounds.includes(selectedRound)) {
        setSelectedRound(availableRounds[0]);
      }
    } else {
      setSelectedRound("");
    }
  }, [availableRounds]);

  const finalMatches = matchesBySport.filter(
    (m) => (m.round || "NONE") === selectedRound,
  );

  const renderMatchItem = ({ item }: { item: any }) => {
    const totalPool = getMatchTotalPool(item._id);
    const myInvested = getMyInvestedAmount(item._id);

    return (
      <View className="mb-4">
        {/* Event Name Header */}
        <View className="flex-row items-center mb-2 ml-1">
          <View className="bg-neutral-800 px-2 py-1 rounded-md mr-2">
            <Text className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
              {item.event?.sport || "EVENT"}
            </Text>
          </View>
          <Text
            className="text-neutral-400 text-xs font-semibold"
            numberOfLines={1}
          >
            {item.event?.name}
          </Text>
        </View>

        {/* Card */}
        <MatchItem
          item={item}
          // Pass stats and myBet to the card if it handles it internally
          matchStats={statsMap[item._id]}
        />

        {/* STATS FOOTER: Shows Total Pool & User Investment */}
        {(totalPool > 0 || myInvested > 0) && (
          <View className="flex-row justify-between items-center bg-neutral-900/40 mx-2 -mt-2 pt-4 pb-2 px-3 rounded-b-xl border-x border-b border-neutral-800/50">
            {/* Pool Stat */}
            <View className="flex-row items-center">
              <Ionicons name="pie-chart-outline" size={14} color="#64748b" />
              <Text className="text-neutral-400 text-[10px] ml-1.5 font-medium">
                Total Pool:{" "}
                <Text className="text-white font-bold">{totalPool}</Text>
              </Text>
            </View>

            {/* My Bet Stat */}
            {myInvested > 0 && (
              <View className="flex-row items-center bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">
                <Ionicons name="checkmark-circle" size={12} color="#4ade80" />
                <Text className="text-green-400 text-[10px] font-bold ml-1">
                  You: {myInvested}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center py-4 mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="bg-neutral-900 p-2 rounded-full mr-4 border border-neutral-800"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-bold text-xl">Match Center</Text>
            <Text className="text-neutral-400 text-xs">
              {allMatches.length} matches found
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00d4ff" />
          </View>
        ) : (
          <>
            {/* Filters */}
            <View className="mb-4 h-10">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {availableSports.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSport(sport)}
                    className={`mr-3 px-4 py-1.5 rounded-full border ${selectedSport === sport ? "bg-white border-white" : "bg-neutral-900 border-neutral-800"}`}
                  >
                    <Text
                      className={`font-bold text-xs ${selectedSport === sport ? "text-black" : "text-neutral-400"}`}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-4 h-10">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {availableRounds.length > 0 ? (
                  availableRounds.map((round) => (
                    <TouchableOpacity
                      key={round}
                      activeOpacity={0.8}
                      onPress={() => setSelectedRound(round)}
                      className={`mr-3 px-5 py-2 rounded-full border flex-row items-center ${selectedRound === round ? "bg-cyan-500/20 border-cyan-500" : "bg-neutral-900 border-neutral-800"}`}
                    >
                      <Text
                        className={`font-bold text-xs ${selectedRound === round ? "text-cyan-400" : "text-neutral-400"}`}
                      >
                        {formatRoundName(round)}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-neutral-600 text-xs mt-2 ml-1">
                    No active rounds for {selectedSport}
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* List */}
            <FlatList
              data={finalMatches}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}
              ListEmptyComponent={
                <View className="items-center justify-center py-20 opacity-50">
                  <Ionicons
                    name="filter-circle-outline"
                    size={64}
                    color="#444"
                  />
                  <Text className="text-neutral-500 mt-4 font-medium text-center">
                    No {selectedSport !== "ALL" ? selectedSport : ""} matches
                    found{"\n"}
                    for {formatRoundName(selectedRound)}
                  </Text>
                </View>
              }
              renderItem={renderMatchItem}
            />
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}
