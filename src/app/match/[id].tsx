import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { TechButton } from "../../components/TechButton";
import { api } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function MatchBetting() {
  const { id } = useLocalSearchParams();
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [match, setMatch] = useState<any>(null);
  const [teamADetails, setTeamADetails] = useState<any>(null);
  const [teamBDetails, setTeamBDetails] = useState<any>(null);

  const [matchStats, setMatchStats] = useState<any[]>([]);

  // CHANGED: Store ALL bets for this match, not just one
  const [myMatchBets, setMyMatchBets] = useState<any[]>([]);

  const [selectedTeam, setSelectedTeam] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMatchData();
    }
  }, [id]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);

      const [matchRes, myInvestRes, statsRes] = await Promise.all([
        api.get(`/match/${id}`),
        api.get(`/investment/my`),
        api.get(`/investment/match/${id}/stats`),
      ]);

      const matchData = matchRes.data;
      setMatch(matchData);
      setMatchStats(statsRes.data);

      // 1. Filter ALL investments for this specific match
      const betsForThisMatch = myInvestRes.data.filter(
        (b: any) => b.match === id || b.match?._id === id,
      );
      setMyMatchBets(betsForThisMatch);

      // 2. Auto-select the team from the most recent bet (if any)
      if (betsForThisMatch.length > 0) {
        // API returns newest first, so index 0 is the latest
        const latestBet = betsForThisMatch[0];
        const teamId = latestBet.team._id || latestBet.team;
        setSelectedTeam(teamId);
      }

      if (matchData.teamA?._id && matchData.teamB?._id) {
        const [resA, resB] = await Promise.all([
          api.get(`/teams/${matchData.teamA._id}`),
          api.get(`/teams/${matchData.teamB._id}`),
        ]);
        setTeamADetails(resA.data);
        setTeamBDetails(resB.data);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load match data");
    } finally {
      setLoading(false);
    }
  };

  const handleBet = async () => {
    if (match.status !== "UPCOMING")
      return Alert.alert("Closed", "Betting is closed for this match.");
    if (!selectedTeam || !amount)
      return Alert.alert("Error", "Select team and amount");

    try {
      await api.post("/investment", {
        matchId: id,
        teamId: selectedTeam,
        pointsInvested: parseInt(amount),
      });

      if (user && updateUser) {
        updateUser({ ...user, points: user.points - parseInt(amount) });
      }

      Alert.alert("Success", "Bet placed successfully!");

      // OPTIONAL: Refresh data instead of going back, so they see the new total
      // router.back();
      fetchMatchData(); // Reload to update totals
      setAmount(""); // Clear input
    } catch (error: any) {
      console.error("Betting Error:", error.response?.data || error.message);
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Error placing bet",
      );
    }
  };

  // Helper: Calculate total points a user has invested on a specific team
  const getUserTotalOnTeam = (teamId: string) => {
    return myMatchBets
      .filter((b) => (b.team._id || b.team) === teamId)
      .reduce((sum, b) => sum + b.pointsInvested, 0);
  };

  // Helper: Calculate total invested in the entire match by the user
  const getUserTotalInMatch = () => {
    return myMatchBets.reduce((sum, b) => sum + b.pointsInvested, 0);
  };

  const getTeamPool = (teamId: string) => {
    const stat = matchStats.find((s: any) => s._id === teamId);
    return stat ? stat.totalPoints : 0;
  };

  const renderRoster = (team: any) => {
    if (!team || !team.members) return null;
    const captain = team.members.find((m: any) => m.role === "CAPTAIN");
    const players = team.members.filter((m: any) => m.role !== "CAPTAIN");

    return (
      <View className="bg-tech-card p-4 rounded-xl border border-tech-border flex-1 mx-1">
        <Text className="text-tech-primary font-bold text-center mb-3 text-sm uppercase">
          {team.name}
        </Text>
        {captain && (
          <View className="flex-row items-center mb-2 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/30">
            <Text className="text-yellow-500 mr-2">👑</Text>
            <View>
              <Text className="text-white font-bold text-xs">
                {captain.user?.name || captain.name || "Captain"}
              </Text>
              <Text className="text-yellow-500/70 text-[10px] font-bold">
                CAPTAIN
              </Text>
            </View>
          </View>
        )}
        {players.map((member: any, index: number) => (
          <View
            key={member._id || index}
            className="flex-row items-center py-1.5 border-b border-tech-border/50"
          >
            <Ionicons name="person" size={12} color="#94a3b8" />
            <Text className="text-gray-300 text-xs ml-2">
              {member.user?.name || member.name || "Player"}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading || !match)
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="text-white mt-4">Loading Match Arena...</Text>
        </View>
      </ScreenWrapper>
    );

  const canBet = match.status === "UPCOMING";
  const totalUserInvestment = getUserTotalInMatch();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-tech-card p-2 rounded-full border border-tech-border mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Match Room</Text>
        </View>

        {/* Status Banner */}
        <View className="items-center mb-6">
          <View
            className={`px-4 py-1 rounded-full border ${match.status === "LIVE" ? "bg-green-500/20 border-green-500" : match.status === "COMPLETED" ? "bg-red-500/20 border-red-500" : "bg-tech-primary/20 border-tech-primary"}`}
          >
            <Text
              className={`font-bold text-xs ${match.status === "LIVE" ? "text-green-400" : match.status === "COMPLETED" ? "text-red-400" : "text-tech-primary"}`}
            >
              STATUS: {match.status}
            </Text>
          </View>
        </View>

        {/* --- TEAM CARDS --- */}
        <View className="flex-row gap-4 mb-6">
          {[match.teamA, match.teamB].map((team) => {
            const isSelected = selectedTeam === team._id;
            // Calculate total user bet for THIS team
            const userTeamTotal = getUserTotalOnTeam(team._id);
            const isMyPick = userTeamTotal > 0;

            return (
              <TouchableOpacity
                key={team._id}
                disabled={!canBet}
                onPress={() => setSelectedTeam(team._id)}
                className={`flex-1 p-4 rounded-xl border-2 items-center justify-between min-h-[140px] ${
                  isSelected
                    ? "bg-tech-primary/10 border-tech-primary"
                    : "bg-tech-card border-tech-border"
                } ${!canBet && !isSelected ? "opacity-40" : ""}`}
              >
                <View className="items-center">
                  <View className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center mb-2">
                    <Text className="text-2xl">🛡️</Text>
                  </View>
                  <Text className="text-white font-bold text-center text-sm mb-1">
                    {team.name}
                  </Text>
                </View>

                <View className="items-center mt-2 w-full pt-2 border-t border-white/10">
                  <Text className="text-tech-muted text-[10px] uppercase font-bold">
                    Total Pool
                  </Text>
                  <Text className="text-white font-bold text-xs">
                    {getTeamPool(team._id)} pts
                  </Text>

                  {isMyPick && (
                    <View className="mt-2 bg-green-500/20 px-2 py-1 rounded border border-green-500/50">
                      <Text className="text-green-400 text-[10px] font-bold">
                        YOUR TOTAL: {userTeamTotal}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --- ROSTERS --- */}
        <View className="mb-8">
          <Text className="text-white font-bold text-md mb-3 ml-1">
            Team Lineups
          </Text>
          <View className="flex-row justify-between">
            {renderRoster(teamADetails)}
            {renderRoster(teamBDetails)}
          </View>
        </View>

        {/* --- BETTING CONTROLS --- */}
        {canBet ? (
          <View className="mb-10">
            <View className="flex-row justify-between mb-2">
              <Text className="text-tech-muted text-xs font-bold">
                WAGER AMOUNT
              </Text>
              <Text className="text-tech-muted text-xs">
                Balance: {user?.points}
              </Text>
            </View>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="bg-tech-card text-white text-3xl font-bold p-4 rounded-xl border border-tech-border mb-6 text-center"
              placeholder="0"
              placeholderTextColor="#64748b"
            />
            <TechButton
              title={totalUserInvestment > 0 ? "ADD MORE" : "CONFIRM WAGER"}
              onPress={handleBet}
            />
            {totalUserInvestment > 0 && (
              <Text className="text-tech-muted text-xs text-center mt-3">
                You have invested a total of{" "}
                <Text className="text-white font-bold">
                  {totalUserInvestment} points
                </Text>{" "}
                in this match.
              </Text>
            )}
          </View>
        ) : (
          <View className="bg-tech-card p-6 rounded-xl border border-tech-border items-center mb-10">
            {totalUserInvestment > 0 ? (
              <>
                <Ionicons name="checkmark-circle" size={40} color="#4ade80" />
                <Text className="text-white font-bold text-lg mt-2">
                  Bets Placed!
                </Text>
                <Text className="text-tech-muted text-center mt-1">
                  You invested a total of {totalUserInvestment} points in this
                  match.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="lock-closed" size={40} color="#64748b" />
                <Text className="text-white font-bold text-lg mt-2">
                  Betting Closed
                </Text>
                <Text className="text-tech-muted text-center mt-1">
                  {match.status === "COMPLETED"
                    ? "This match has ended."
                    : "Match is live! Bets are locked."}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
