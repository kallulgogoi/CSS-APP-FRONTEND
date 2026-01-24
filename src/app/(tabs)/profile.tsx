import React, { useState, useEffect } from "react";
import {
  Text,
  FlatList,
  View,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Removed "HISTORY"
type TabType = "TEAMS" | "BETS";

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("TEAMS");
  const [investments, setInvestments] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [investRes, teamsRes] = await Promise.all([
        api.get("/investment/my").catch((e) => ({ data: [] })),
        api.get("/teams/my").catch((e) => ({ data: [] })),
      ]);

      setInvestments(investRes.data || []);
      setMyTeams(teamsRes.data || []);
    } catch (e: any) {
      console.log("Error fetching profile:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTeamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/team/${item._id}` as any)}
      className="bg-tech-card p-4 rounded-2xl mb-4 border border-tech-border relative overflow-hidden"
    >
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-tech-primary" />

      <View className="pl-2">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-tech-muted text-xs font-bold uppercase tracking-wider">
            {item.event?.sport || "EVENT"}
          </Text>
          <View
            className={`px-2 py-1 rounded-full border ${item.approved ? "bg-green-500/10 border-green-500" : "bg-yellow-500/10 border-yellow-500"}`}
          >
            <Text
              className={`text-[10px] font-bold ${item.approved ? "text-green-400" : "text-yellow-400"}`}
            >
              {item.approved ? "APPROVED" : "PENDING"}
            </Text>
          </View>
        </View>

        <Text className="text-white text-xl font-bold mb-1">{item.name}</Text>
        <Text className="text-gray-400 text-sm mb-3">
          Event: {item.event?.name}
        </Text>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="people" size={14} color="#64748b" />
            <Text className="text-tech-muted text-xs ml-1">
              {item.members?.length || 1} Members
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#64748b" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // 2. BETS CARD (With Time)
  const renderBetItem = ({ item }: { item: any }) => {
    const isWin = item.match?.winner === item.team?._id;
    const isCompleted = item.match?.status === "COMPLETED";

    return (
      <View className="bg-tech-card p-4 rounded-2xl mb-3 border border-tech-border">
        <View className="flex-row justify-between mb-2">
          <Text className="text-tech-muted text-xs font-bold uppercase">
            {item.match?.teamA?.name || "Team A"} vs{" "}
            {item.match?.teamB?.name || "Team B"}
          </Text>
          {isCompleted ? (
            <Text
              className={`text-xs font-bold ${isWin ? "text-green-400" : "text-red-400"}`}
            >
              {isWin ? "WON" : "LOST"}
            </Text>
          ) : (
            <Text className="text-yellow-400 text-xs font-bold">LIVE</Text>
          )}
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-lg">
              {item.team?.name}
            </Text>
            <Text className="text-tech-muted text-[10px] mt-1">
              Placed: {formatTime(item.createdAt)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-tech-accent font-bold text-xl">
              {item.pointsInvested}
            </Text>
            <Text className="text-tech-muted text-[10px] font-bold">
              PTS INVESTED
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="mb-6">
      <View className="flex-row justify-end mb-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"
        >
          <Ionicons name="log-out-outline" size={16} color="#f87171" />
          <Text className="text-red-400 text-xs font-bold ml-1">LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-8">
        <View className="mb-4 p-1 rounded-full border-2 border-tech-primary shadow-2xl shadow-tech-primary/50">
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              className="w-24 h-24 rounded-full bg-black"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-tech-card items-center justify-center">
              <Text className="text-4xl text-tech-muted font-bold">
                {user?.name?.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-2xl font-bold text-white mb-1">{user?.name}</Text>
        <Text className="text-tech-muted mb-3">{user?.email}</Text>

        <View className="flex-row gap-4">
          <View className="bg-tech-card px-4 py-2 rounded-xl border border-tech-border items-center min-w-[100px]">
            <Text className="text-tech-accent font-bold text-xl">
              {user?.points}
            </Text>
            <Text className="text-tech-muted text-[10px] font-bold">
              BALANCE
            </Text>
          </View>
          <View className="bg-tech-card px-4 py-2 rounded-xl border border-tech-border items-center min-w-[100px]">
            <Text className="text-white font-bold text-xl">
              {myTeams.length}
            </Text>
            <Text className="text-tech-muted text-[10px] font-bold">TEAMS</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-tech-card p-1 rounded-xl border border-tech-border mb-2">
        {(["TEAMS", "BETS"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? "bg-tech-primary shadow-sm" : "bg-transparent"}`}
          >
            <Text
              className={`text-xs font-bold ${activeTab === tab ? "text-black" : "text-tech-muted"}`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={activeTab === "TEAMS" ? myTeams : investments}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#06b6d4"
            />
          }
          renderItem={activeTab === "TEAMS" ? renderTeamItem : renderBetItem}
          ListEmptyComponent={
            <View className="items-center mt-10 opacity-50">
              <Ionicons name="folder-open-outline" size={48} color="#64748b" />
              <Text className="text-tech-muted mt-2">No records found</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}
