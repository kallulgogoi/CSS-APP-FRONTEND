import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export const MatchItem = ({
  item,
  myBet,
  matchStats,
}: {
  item: any;
  myBet?: any;
  matchStats?: any[];
}) => {
  const router = useRouter();

  const formatMatchTime = (isoString: string) => {
    if (!isoString) return { date: "TBD", time: "" };
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatPoints = (num: number) => {
    if (!num) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const { date, time } = formatMatchTime(item.startTime);

  const isCompleted = item.status === "COMPLETED";
  const winnerId = item.winner?._id || item.winner;
  const isTeamAWin = isCompleted && winnerId === item.teamA?._id;
  const isTeamBWin = isCompleted && winnerId === item.teamB?._id;

  const myBetTeamId = myBet?.team?._id || myBet?.team;
  const isMyBetA = myBetTeamId === item.teamA?._id;
  const isMyBetB = myBetTeamId === item.teamB?._id;

  // --- LOGIC FROM ADMIN PANEL ---
  // If matchStats exists, calculate totals from it. Otherwise fallback to item.totalInvestedX

  const teamAId = item.teamA?._id || item.teamA;
  const teamBId = item.teamB?._id || item.teamB;

  let totalInvestedA = item.totalInvestedA || 0;
  let totalInvestedB = item.totalInvestedB || 0;

  if (matchStats && Array.isArray(matchStats)) {
    const statsA = matchStats.find((s: any) => s._id === teamAId);
    const statsB = matchStats.find((s: any) => s._id === teamBId);

    if (statsA) totalInvestedA = statsA.totalPoints;
    if (statsB) totalInvestedB = statsB.totalPoints;
  }
  // -----------------------------

  return (
    <TouchableOpacity
      onPress={() => router.push(`/match/${item._id}` as any)}
      className="bg-tech-card p-4 mb-3 rounded-xl border border-tech-border"
    >
      {/* Header: Status & Time */}
      <View className="flex-row justify-between items-center mb-4">
        <View
          className={`px-2 py-0.5 rounded border ${
            item.status === "LIVE"
              ? "bg-green-500/20 border-green-500"
              : item.status === "COMPLETED"
                ? "bg-red-500/20 border-red-500"
                : "bg-tech-primary/20 border-tech-primary"
          }`}
        >
          <Text
            className={`text-[10px] font-bold ${
              item.status === "LIVE"
                ? "text-green-400"
                : item.status === "COMPLETED"
                  ? "text-red-400"
                  : "text-tech-primary"
            }`}
          >
            {item.status}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text className="text-tech-muted text-xs font-bold ml-1">
            {date} • {time}
          </Text>
        </View>
      </View>

      {/* TEAMS ROW */}
      <View className="flex-row justify-between items-start">
        {/* === TEAM A === */}
        <View className="flex-1 items-start mr-2">
          <Text
            className="text-white font-bold text-lg leading-6 mb-1"
            numberOfLines={1}
          >
            {item.teamA?.name}
          </Text>

          <View className="items-start gap-1">
            <View className="flex-row items-center flex-wrap gap-2">
              {item.scoreA && (
                <View className="bg-tech-bg px-2 py-1 rounded border border-tech-border min-w-[30px] items-center">
                  <Text className="text-white font-bold text-xs">
                    {item.scoreA}
                  </Text>
                </View>
              )}
              {isCompleted && (
                <View
                  className={`px-1.5 py-0.5 rounded ${isTeamAWin ? "bg-green-500/20" : "bg-red-500/10"}`}
                >
                  <Text
                    className={`text-[10px] font-bold ${isTeamAWin ? "text-green-400" : "text-red-400"}`}
                  >
                    {isTeamAWin ? "WIN" : "LOSS"}
                  </Text>
                </View>
              )}
            </View>

            {/* Total Investment Badge (Team A) */}
            <View className="flex-row items-center bg-tech-bg/50 px-1.5 py-0.5 rounded mt-1">
              <Ionicons name="cash-outline" size={10} color="#fbbf24" />
              <Text className="text-tech-muted text-[10px] ml-1 font-bold">
                Total: {formatPoints(totalInvestedA)}
              </Text>
            </View>

            {/* Personal Bet Badge (Team A) */}
            {isMyBetA && (
              <View className="flex-row items-center bg-tech-primary/20 px-1.5 py-0.5 rounded border border-tech-primary/50 mt-1">
                <Ionicons name="person" size={10} color="#06b6d4" />
                <Text className="text-tech-primary text-[10px] ml-1 font-bold">
                  YOU: {formatPoints(myBet.pointsInvested)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* VS Badge */}
        <View className="bg-tech-bg px-2 py-1 rounded-full border border-tech-primary mx-1 self-center mt-1">
          <Text className="text-tech-primary font-bold text-[10px]">VS</Text>
        </View>

        {/* === TEAM B === */}
        <View className="flex-1 items-end ml-2">
          <Text
            className="text-white font-bold text-lg leading-6 mb-1 text-right"
            numberOfLines={1}
          >
            {item.teamB?.name}
          </Text>

          <View className="items-end gap-1">
            <View className="flex-row items-center justify-end flex-wrap gap-2">
              {isCompleted && (
                <View
                  className={`px-1.5 py-0.5 rounded ${isTeamBWin ? "bg-green-500/20" : "bg-red-500/10"}`}
                >
                  <Text
                    className={`text-[10px] font-bold ${isTeamBWin ? "text-green-400" : "text-red-400"}`}
                  >
                    {isTeamBWin ? "WIN" : "LOSS"}
                  </Text>
                </View>
              )}
              {item.scoreB && (
                <View className="bg-tech-bg px-2 py-1 rounded border border-tech-border min-w-[30px] items-center">
                  <Text className="text-white font-bold text-xs">
                    {item.scoreB}
                  </Text>
                </View>
              )}
            </View>

            {/* Total Investment Badge (Team B) */}
            <View className="flex-row items-center bg-tech-bg/50 px-1.5 py-0.5 rounded mt-1">
              <Text className="text-tech-muted text-[10px] mr-1 font-bold">
                Total: {formatPoints(totalInvestedB)}
              </Text>
              <Ionicons name="cash-outline" size={10} color="#fbbf24" />
            </View>

            {/* Personal Bet Badge (Team B) */}
            {isMyBetB && (
              <View className="flex-row items-center bg-tech-primary/20 px-1.5 py-0.5 rounded border border-tech-primary/50 mt-1">
                <Text className="text-tech-primary text-[10px] mr-1 font-bold">
                  YOU: {formatPoints(myBet.pointsInvested)}
                </Text>
                <Ionicons name="person" size={10} color="#06b6d4" />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
