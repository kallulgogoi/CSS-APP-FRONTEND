import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
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
  const [selectedTeam, setSelectedTeam] = useState("");
  const [amount, setAmount] = useState("");

  // Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get(`/match/${id}`)
        .then((res) => setMatch(res.data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleBet = async () => {
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
      router.back();
    } catch (error: any) {
      console.error("Betting Error:", error.response?.data || error.message);
      Alert.alert(
        "Failed",
        error.response?.data?.message || "Error placing bet",
      );
    }
  };

  if (loading || !match)
    return (
      <ScreenWrapper>
        <Text className="text-white text-center mt-10">Loading Match...</Text>
      </ScreenWrapper>
    );

  const isBettingOpen = match.status === "UPCOMING";

  return (
    <ScreenWrapper>
      <ScrollView>
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

        {/* Match Status Banner */}
        <View className="items-center mb-8">
          <View
            className={`px-4 py-1 rounded-full border ${
              match.status === "LIVE"
                ? "bg-green-500/20 border-green-500"
                : match.status === "COMPLETED"
                  ? "bg-red-500/20 border-red-500"
                  : "bg-tech-primary/20 border-tech-primary"
            }`}
          >
            <Text
              className={`font-bold text-xs ${
                match.status === "LIVE"
                  ? "text-green-400"
                  : match.status === "COMPLETED"
                    ? "text-red-400"
                    : "text-tech-primary"
              }`}
            >
              STATUS: {match.status}
            </Text>
          </View>
        </View>

        {/* Teams */}
        <View className="flex-row gap-4 mb-8">
          {[match.teamA, match.teamB].map((team) => (
            <TouchableOpacity
              key={team._id}
              disabled={!isBettingOpen}
              onPress={() => setSelectedTeam(team._id)}
              className={`flex-1 p-6 rounded-xl border-2 items-center ${
                selectedTeam === team._id
                  ? "bg-tech-primary/10 border-tech-primary"
                  : "bg-tech-card border-tech-border"
              } ${!isBettingOpen ? "opacity-50" : ""}`}
            >
              <Text className="text-white font-bold text-center">
                {team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Betting Controls - ONLY SHOW IF UPCOMING */}
        {isBettingOpen ? (
          <>
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
            <TechButton title="CONFIRM WAGER" onPress={handleBet} />
          </>
        ) : (
          /* LOCKED VIEW */
          <View className="bg-tech-card p-6 rounded-xl border border-tech-border items-center">
            <Ionicons name="lock-closed" size={40} color="#64748b" />
            <Text className="text-white font-bold text-lg mt-2">
              Betting Closed
            </Text>
            <Text className="text-tech-muted text-center mt-1">
              {match.status === "COMPLETED"
                ? "This match has ended."
                : "Match is live! Bets are locked."}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
