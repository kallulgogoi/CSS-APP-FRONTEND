import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";

// Import Custom Components
import { EventHeader } from "../../components/event/EventHeader";
import { MatchItem } from "../../components/event/MatchItem";
import { RegistrationModal } from "../../components/event/RegistrationModal";

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [matches, setMatches] = useState([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, matchRes, myTeamsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/match/event/${id}`),
        api.get(`/teams/my`),
      ]);

      setEvent(eventRes.data);
      setMatches(matchRes.data);

      const myTeamForEvent = myTeamsRes.data.find(
        (t: any) => t.event._id === id || t.event === id,
      );

      if (myTeamForEvent) setIsRegistered(true);
    } catch (error) {
      console.log("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonState = () => {
    if (isRegistered)
      return {
        text: "ALREADY REGISTERED",
        disabled: true,
        color: "bg-gray-600",
      };
    if (!event?.registrationOpen)
      return {
        text: "REGISTRATION CLOSED",
        disabled: true,
        color: "bg-red-500/80",
      };
    return { text: "REGISTER TEAM", disabled: false, color: "bg-tech-primary" };
  };

  const btnState = getButtonState();

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className="flex-1">
        {/* Navigation Header */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-tech-card p-2 rounded-full border border-tech-border mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Event Details</Text>
        </View>

        {/* Content List */}
        <FlatList
          data={matches}
          keyExtractor={(item: any) => item._id}
          ListHeaderComponent={<EventHeader event={event} />}
          ListEmptyComponent={
            <Text className="text-tech-muted italic text-center mt-4">
              No matches scheduled.
            </Text>
          }
          renderItem={({ item }) => <MatchItem item={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* Floating Action Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-tech-bg/90 border-t border-tech-border">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            disabled={btnState.disabled}
            className={`w-full py-4 rounded-xl items-center shadow-lg ${btnState.color}`}
          >
            <Text
              className={`font-bold text-lg ${btnState.disabled ? "text-gray-300" : "text-black"}`}
            >
              {btnState.text}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Registration Modal */}
        <RegistrationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          event={event}
          user={user}
          onSuccess={() => setIsRegistered(true)}
        />
      </View>
    </ScreenWrapper>
  );
}
