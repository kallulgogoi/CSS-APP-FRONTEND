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
      className="bg-[#0f172a] p-4 rounded-xl mb-3 mx-4 border border-slate-800"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-3">
              <Ionicons
                name={
                  item.event?.sport === "Football"
                    ? "football"
                    : item.event?.sport === "Basketball"
                      ? "basketball"
                      : "people"
                }
                size={20}
                color="#06b6d4"
              />
            </View>
            <View>
              <Text className="text-slate-400 text-xs font-semibold uppercase">
                {item.event?.sport || "SPORT"}
              </Text>
              <Text className="text-white text-lg font-bold">{item.name}</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-sm">
            {item.event?.name || "Event"}
          </Text>
        </View>
        <View
          className={`px-3 py-1.5 rounded-full ${item.approved ? "bg-emerald-900/30 border border-emerald-800" : "bg-amber-900/30 border border-amber-800"}`}
        >
          <Text
            className={`text-xs font-semibold ${item.approved ? "text-emerald-400" : "text-amber-400"}`}
          >
            {item.approved ? "ACTIVE" : "PENDING"}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-slate-800">
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={16} color="#64748b" />
          <Text className="text-slate-400 text-sm ml-2">
            {item.members?.length || 1} members
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[#06b6d4] text-sm font-semibold mr-2">
            VIEW
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#06b6d4" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBetItem = ({ item }: { item: any }) => {
    const isWin = item.match?.winner === item.team?._id;
    const isCompleted = item.match?.status === "COMPLETED";

    return (
      <View className="bg-[#0f172a] p-4 rounded-xl mb-3 mx-4 border border-slate-800">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-semibold uppercase mb-1">
              {item.match?.teamA?.name || "Team A"} vs{" "}
              {item.match?.teamB?.name || "Team B"}
            </Text>
            <Text className="text-white font-bold text-lg">
              {item.team?.name}
            </Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${isCompleted ? (isWin ? "bg-emerald-900/30 border border-emerald-800" : "bg-red-900/30 border border-red-800") : "bg-amber-900/30 border border-amber-800"}`}
          >
            <Text
              className={`text-xs font-semibold ${isCompleted ? (isWin ? "text-emerald-400" : "text-red-400") : "text-amber-400"}`}
            >
              {isCompleted ? (isWin ? "WON" : "LOST") : "LIVE"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text className="text-slate-400 text-xs ml-2">
                {formatTime(item.createdAt)}
              </Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {isCompleted ? "Match completed" : "Match in progress"}
            </Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Ionicons name="trophy-outline" size={20} color="#06b6d4" />
              </View>
              <View>
                <Text className="text-white font-bold text-xl">
                  {item.pointsInvested}
                </Text>
                <Text className="text-slate-400 text-xs font-semibold">
                  POINTS
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="mb-6">
      {/* Profile Header */}
      <View className="bg-[#0f172a] border-b border-slate-800 pb-6">
        <View className="px-4 pt-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">Profile</Text>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center bg-slate-900 px-4 py-2.5 rounded-lg"
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text className="text-red-400 text-sm font-semibold ml-2">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View className="items-center mb-6">
            <View className="mb-4 relative">
              <View className="absolute -inset-1 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] rounded-full opacity-30 blur-sm" />
              <View className="p-1 rounded-full border-2 border-[#06b6d4]">
                {user?.profilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-slate-800 items-center justify-center">
                    <Text className="text-white text-3xl font-bold">
                      {user?.name?.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text className="text-white text-2xl font-bold mb-1">
              {user?.name}
            </Text>
            <Text className="text-slate-400 mb-6">{user?.email}</Text>

            {/* Stats */}
            <View className="flex-row gap-4 w-full">
              <View className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      {user?.points}
                    </Text>
                    <Text className="text-slate-400 text-sm">Balance</Text>
                  </View>
                  <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center">
                    <Ionicons name="wallet-outline" size={20} color="#06b6d4" />
                  </View>
                </View>
              </View>

              <View className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      {myTeams.length}
                    </Text>
                    <Text className="text-slate-400 text-sm">Teams</Text>
                  </View>
                  <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center">
                    <Ionicons name="people-outline" size={20} color="#06b6d4" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 mt-6 mb-4">
        <View className="flex-row bg-slate-900 p-1 rounded-xl">
          {(["TEAMS", "BETS"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 rounded-lg items-center ${activeTab === tab ? "bg-slate-800" : ""}`}
            >
              <Text
                className={`text-sm font-semibold ${activeTab === tab ? "text-white" : "text-slate-400"}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    const data = activeTab === "TEAMS" ? myTeams : investments;
    const renderItem = activeTab === "TEAMS" ? renderTeamItem : renderBetItem;

    if (data.length === 0) {
      return (
        <View className="items-center mt-10 px-4">
          <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
            <Ionicons
              name={activeTab === "TEAMS" ? "people-outline" : "trophy-outline"}
              size={32}
              color="#475569"
            />
          </View>
          <Text className="text-white text-lg font-semibold mb-2">
            No {activeTab.toLowerCase()} found
          </Text>
          <Text className="text-slate-400 text-center">
            {activeTab === "TEAMS"
              ? "You haven't joined any teams yet"
              : "You haven't placed any bets yet"}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    );
  };

  return (
    <ScreenWrapper>
      {loading ? (
        <View className="flex-1 justify-center items-center bg-[#020617]">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="text-slate-400 mt-4 font-semibold">
            Loading profile...
          </Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#06b6d4"
              colors={["#06b6d4"]}
            />
          }
          ListFooterComponent={renderContent}
          showsVerticalScrollIndicator={false}
          className="bg-[#020617]"
        />
      )}
    </ScreenWrapper>
  );
}
