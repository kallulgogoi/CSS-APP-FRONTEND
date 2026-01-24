import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

export default function TeamDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [teamName, setTeamName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [memberEmails, setMemberEmails] = useState("");

  useEffect(() => {
    if (id) fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      const data = res.data;

      setTeam(data);
      setTeamName(data.name);
      setCaptainPhone(data.captainPhone || "");

      // Convert member objects back to comma separated emails for editing
      if (data.members) {
        const emails = data.members
          .filter((m: any) => m.role !== "CAPTAIN")
          .map((m: any) => m.email)
          .join(", ");
        setMemberEmails(emails);
      }
    } catch (error) {
      console.log("Error fetching team:", error);
      Alert.alert("Error", "Could not load team details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!captainPhone) return Alert.alert("Error", "Phone number is required");
    if (team.event.type !== "SOLO" && !teamName)
      return Alert.alert("Error", "Team Name is required");

    try {
      setSaving(true);

      const membersList = memberEmails
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");

      // Ensure your backend supports PUT /teams/:id
      await api.put(`/teams/${id}`, {
        name: teamName,
        captainPhone,
        members: membersList,
      });

      Alert.alert("Success", "Team details updated!");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      </ScreenWrapper>
    );

  if (!team) return null;

  const isEditable = team.event?.registrationOpen && !team.approved;

  return (
    <ScreenWrapper>
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-tech-card p-2 rounded-full border border-tech-border mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Team Management</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View
            className={`p-4 rounded-xl mb-6 border ${isEditable ? "bg-tech-primary/10 border-tech-primary" : "bg-red-500/10 border-red-500"}`}
          >
            <View className="flex-row items-center mb-1">
              <Ionicons
                name={isEditable ? "create-outline" : "lock-closed-outline"}
                size={20}
                color={isEditable ? "#06b6d4" : "#f87171"}
              />
              <Text
                className={`font-bold ml-2 ${isEditable ? "text-tech-primary" : "text-red-400"}`}
              >
                {isEditable ? "EDIT MODE ACTIVE" : "DETAILS LOCKED"}
              </Text>
            </View>
            <Text className="text-tech-muted text-xs">
              {isEditable
                ? "Registration is open. You can update your team details."
                : "Registration is closed or team is already approved."}
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Event Name (Read Only) */}
            <View>
              <Text className="text-tech-muted text-xs font-bold mb-2">
                EVENT
              </Text>
              <View className="bg-tech-card/50 p-4 rounded-xl border border-tech-border">
                <Text className="text-white font-bold">{team.event?.name}</Text>
              </View>
            </View>

            {/* Team Name */}
            {team.event?.type !== "SOLO" && (
              <View>
                <Text className="text-tech-muted text-xs font-bold mb-2">
                  TEAM NAME
                </Text>
                <TextInput
                  value={teamName}
                  onChangeText={setTeamName}
                  editable={isEditable}
                  className={`bg-tech-card text-white p-4 rounded-xl border ${isEditable ? "border-tech-border" : "border-transparent opacity-50"}`}
                />
              </View>
            )}

            {/* Phone */}
            <View>
              <Text className="text-tech-muted text-xs mt-2 font-bold mb-2">
                CAPTAIN PHONE
              </Text>
              <TextInput
                value={captainPhone}
                onChangeText={setCaptainPhone}
                editable={isEditable}
                keyboardType="phone-pad"
                className={`bg-tech-card text-white p-4 rounded-xl border ${isEditable ? "border-tech-border" : "border-transparent opacity-50"}`}
              />
            </View>

            {/* Members */}
            {team.event?.type !== "SOLO" && (
              <View>
                <Text className="text-tech-muted text-xs font-bold mb-2">
                  TEAM MEMBERS (Emails)
                </Text>
                <TextInput
                  value={memberEmails}
                  onChangeText={setMemberEmails}
                  editable={isEditable}
                  multiline
                  className={`bg-tech-card text-white p-4 rounded-xl border h-24 ${isEditable ? "border-tech-border" : "border-transparent opacity-50"}`}
                  textAlignVertical="top"
                />
                <Text className="text-tech-muted text-[10px] mt-2 italic">
                  Comma separated college emails.
                </Text>
              </View>
            )}
          </View>

          {/* Update Button */}
          {isEditable && (
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving}
              className="mt-8 bg-tech-primary py-4 rounded-xl items-center mb-10"
            >
              {saving ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text className="text-black font-bold text-lg">
                  UPDATE DETAILS
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
