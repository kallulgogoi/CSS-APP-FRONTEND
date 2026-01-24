import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { TechButton } from "../../components/TechButton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";

export default function Onboarding() {
  const { updateUser } = useAuth();
  const [scholarId, setScholarId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!scholarId) return Alert.alert("Required", "Enter Scholar ID");
    setLoading(true);
    try {
      const res = await api.patch("/users/me", { scholarId });
      updateUser({ scholarId: res.data.scholarId });
    } catch (error) {
      Alert.alert("Error", "Failed to update ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-white mb-6">
          Enter Scholar ID
        </Text>
        <TextInput
          className="bg-tech-card border border-tech-border text-white text-xl p-4 rounded-xl mb-8 font-bold"
          placeholder="e.g. 2412109"
          placeholderTextColor="#64748b"
          value={scholarId}
          onChangeText={setScholarId}
        />
        <TechButton
          title="CONFIRM ID"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
}
