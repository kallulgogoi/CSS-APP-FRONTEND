import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../constants";
import { useRouter } from "expo-router";

interface RegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  event: any;
  user: any;
  onSuccess: () => void;
}

export const RegistrationModal = ({
  visible,
  onClose,
  event,
  user,
  onSuccess,
}: RegistrationModalProps) => {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const addMemberField = () => {
    if (event.maxTeamSize && memberEmails.length >= event.maxTeamSize - 1) {
      return Alert.alert(
        "Limit Reached",
        `Max team size is ${event.maxTeamSize}`,
      );
    }
    setMemberEmails([...memberEmails, ""]);
  };

  const removeMemberField = (index: number) => {
    const updated = [...memberEmails];
    updated.splice(index, 1);
    setMemberEmails(updated);
  };

  const updateEmail = (text: string, index: number) => {
    const updated = [...memberEmails];
    updated[index] = text;
    setMemberEmails(updated);
  };

  const handleRegister = async () => {
    if (!captainPhone)
      return Alert.alert("Missing Info", "Please enter captain's phone.");
    if (event.type !== "SOLO" && !teamName)
      return Alert.alert("Missing Info", "Team Name is required.");

    const validEmails = memberEmails
      .map((e) => e.trim())
      .filter((e) => e !== "");

    if (event.type !== "SOLO" && validEmails.length === 0) {
      return Alert.alert("Missing Info", "Add at least one team member.");
    }

    try {
      setSubmitting(true);

      const membersPayload = validEmails.map((email) => ({
        email,
        role: "PLAYER",
        phone: "",
      }));

      await api.post("/teams", {
        eventId: event._id,
        name: event.type === "SOLO" ? user?.name : teamName,
        captainPhone: captainPhone,
        members: membersPayload,
      });
      Alert.alert(
        "Registration Submitted!",
        "Your team has been registered successfully.\n\nPlease wait for Admin Approval. You can check your status in your Profile.",
        [
          {
            text: "Stay Here",
            onPress: () => {
              onSuccess();
              onClose();
              resetForm();
            },
            style: "cancel",
          },
          {
            text: "Go to Profile",
            onPress: () => {
              onSuccess();
              onClose();
              resetForm();
              router.push("/profile");
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Registration Failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamName("");
    setCaptainPhone("");
    setMemberEmails([""]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <View className="bg-black/80 flex-1 justify-end">
          <View className="bg-tech-card border-t border-tech-primary p-6 rounded-t-3xl h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-white">
                Registration
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={30} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                {/* Team Name */}
                {event?.type !== "SOLO" && (
                  <View>
                    <Text className="text-tech-muted text-xs font-bold mb-2">
                      TEAM NAME
                    </Text>
                    <TextInput
                      value={teamName}
                      onChangeText={setTeamName}
                      placeholder="Enter team name"
                      placeholderTextColor="#64748b"
                      className="bg-tech-bg text-white p-4 rounded-xl border border-tech-border"
                    />
                  </View>
                )}

                {/* Captain Phone */}
                <View>
                  <Text className="text-tech-muted text-xs font-bold mb-2">
                    CAPTAIN PHONE
                  </Text>
                  <TextInput
                    value={captainPhone}
                    onChangeText={setCaptainPhone}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    placeholderTextColor="#64748b"
                    className="bg-tech-bg text-white p-4 rounded-xl border border-tech-border"
                  />
                </View>

                {/* Dynamic Members Section */}
                {event?.type !== "SOLO" && (
                  <View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-tech-muted text-xs font-bold">
                        TEAM MEMBERS
                      </Text>
                      <TouchableOpacity
                        onPress={addMemberField}
                        className="flex-row items-center"
                      >
                        <Ionicons name="add-circle" size={18} color="#06b6d4" />
                        <Text className="text-tech-primary text-xs font-bold ml-1">
                          ADD MEMBER
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {memberEmails.map((email, index) => (
                      <View key={index} className="flex-row items-center mb-2">
                        <TextInput
                          value={email}
                          onChangeText={(text) => updateEmail(text, index)}
                          placeholder={`Member ${index + 1} Email (e.g. name@college.edu)`}
                          placeholderTextColor="#64748b"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          className="flex-1 bg-tech-bg text-white p-3 rounded-xl border border-tech-border mr-2"
                        />
                        {memberEmails.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeMemberField(index)}
                            className="p-2 bg-red-500/20 rounded-lg"
                          >
                            <Ionicons name="trash" size={18} color="#f87171" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <Text className="text-tech-muted text-[10px] italic">
                      Enter valid college email IDs for all members.
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={submitting}
                className="mt-8 bg-tech-primary py-4 rounded-xl items-center mb-10"
              >
                {submitting ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-bold text-lg">
                    CONFIRM REGISTRATION
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
