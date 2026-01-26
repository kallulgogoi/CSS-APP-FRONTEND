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
  Keyboard,
  TouchableWithoutFeedback,
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
      return Alert.alert("Missing Info", "Enter captain's phone.");
    if (event.type !== "SOLO" && !teamName)
      return Alert.alert("Missing Info", "Team Name required.");

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
        "Success!",
        "Registration Submitted. Wait for Admin Approval.",
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess();
              onClose();
              resetForm();
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

  // 1. Conditional Wrapper: Only use KeyboardAvoidingView on iOS
  const Wrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === "ios" ? { behavior: "padding" as const } : {};

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/80">
          <Wrapper
            {...wrapperProps}
            className="w-full h-[85%]" // Take up 85% of screen
          >
            <View className="flex-1 bg-tech-card border-t border-tech-primary rounded-t-3xl overflow-hidden">
              {/* Header */}
              <View className="flex-row justify-between items-center p-6 border-b border-tech-border/30 bg-tech-card z-10">
                <Text className="text-2xl font-bold text-white">
                  {event?.type === "SOLO"
                    ? "Solo Registration"
                    : "Team Registration"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={30} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* ScrollView */}
              <ScrollView
                className="flex-1 px-6 pt-4"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                // 2. Large padding allows scrolling content above keyboard
                contentContainerStyle={{ paddingBottom: 400 }}
              >
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

                  {/* Phone */}
                  <View>
                    <Text className="text-tech-muted text-xs font-bold mb-2">
                      PHONE NUMBER
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

                  {/* Members */}
                  {event?.type !== "SOLO" && (
                    <View>
                      <View className="flex-row justify-between items-center mb-2 mt-2">
                        <Text className="text-tech-muted text-xs font-bold">
                          TEAM MEMBERS
                        </Text>
                        <TouchableOpacity
                          onPress={addMemberField}
                          className="flex-row items-center"
                        >
                          <Ionicons
                            name="add-circle"
                            size={18}
                            color="#06b6d4"
                          />
                          <Text className="text-tech-primary text-xs font-bold ml-1">
                            ADD
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {memberEmails.map((email, index) => (
                        <View
                          key={index}
                          className="flex-row items-center mb-3"
                        >
                          <TextInput
                            value={email}
                            onChangeText={(text) => updateEmail(text, index)}
                            placeholder={`Member ${index + 1} Email`}
                            placeholderTextColor="#64748b"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            className="flex-1 bg-tech-bg text-white p-3 rounded-xl border border-tech-border mr-2"
                          />
                          {memberEmails.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeMemberField(index)}
                              className="p-3 bg-red-500/20 rounded-xl"
                            >
                              <Ionicons
                                name="trash"
                                size={18}
                                color="#f87171"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={submitting}
                  className="mt-8 bg-tech-primary py-4 rounded-xl items-center"
                >
                  {submitting ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text className="text-black font-bold text-lg">
                      CONFIRM
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Wrapper>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
