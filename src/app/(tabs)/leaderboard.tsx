import React, { useState, useEffect } from "react";
import {
  Text,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

interface LeaderboardItem {
  _id: string;
  name?: string;
  points?: number;
  teamName?: string;
  totalInvestment?: number;
  sport?: string;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"USERS" | "TEAMS">("USERS");

  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "USERS" ? "/leaderboard/users" : "/leaderboard/teams";
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (error) {
      console.error("Leaderboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return { color: "#FFD700", icon: "trophy" }; // Gold
      case 1:
        return { color: "#C0C0C0", icon: "medal" }; // Silver
      case 2:
        return { color: "#CD7F32", icon: "medal" }; // Bronze
      default:
        return { color: "#64748b", icon: "ribbon" }; // Tech Muted
    }
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-white">Leaderboard</Text>
        <Text className="text-tech-muted text-xs font-bold tracking-widest uppercase">
          Top Performers
        </Text>
      </View>

      {/* Toggle Switch */}
      <View className="flex-row bg-tech-card border border-tech-border rounded-xl p-1 mb-6">
        <TouchableOpacity
          onPress={() => setActiveTab("USERS")}
          className={`flex-1 py-3 rounded-lg items-center ${
            activeTab === "USERS" ? "bg-tech-primary" : "bg-transparent"
          }`}
        >
          <Text
            className={`font-bold text-xs uppercase tracking-wider ${
              activeTab === "USERS" ? "text-black" : "text-tech-muted"
            }`}
          >
            Top Investors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("TEAMS")}
          className={`flex-1 py-3 rounded-lg items-center ${
            activeTab === "TEAMS" ? "bg-tech-primary" : "bg-transparent"
          }`}
        >
          <Text
            className={`font-bold text-xs uppercase tracking-wider ${
              activeTab === "TEAMS" ? "text-black" : "text-tech-muted"
            }`}
          >
            Highest Valued
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchLeaderboard}
            tintColor="#06b6d4"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Text className="text-tech-muted text-center mt-10">
              No data available yet.
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => {
          const rankStyle = getRankStyle(index);
          const isUser = activeTab === "USERS";

          return (
            <View className="flex-row items-center bg-tech-card mb-3 p-4 rounded-2xl border border-tech-border">
              {/* Rank Badge */}
              <View className="w-10 items-center justify-center mr-4">
                {index < 3 ? (
                  <Ionicons
                    name={rankStyle.icon as any}
                    size={24}
                    color={rankStyle.color}
                  />
                ) : (
                  <Text className="text-tech-muted font-bold text-lg">
                    #{index + 1}
                  </Text>
                )}
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {/* Using optional chaining fallback or asserting type logic */}
                  {isUser ? item.name : item.teamName}
                </Text>
                {!isUser && item.sport && (
                  <Text className="text-tech-muted text-xs uppercase font-bold">
                    {item.sport}
                  </Text>
                )}
              </View>

              <View className="items-end">
                <Text className="text-tech-accent font-extrabold text-xl">
                  {isUser ? item.points : item.totalInvestment}
                </Text>
                <Text className="text-tech-muted text-[10px] font-bold">
                  {/* Change label based on context */}
                  {isUser ? "INVESTED" : "PTS"}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScreenWrapper>
  );
}
