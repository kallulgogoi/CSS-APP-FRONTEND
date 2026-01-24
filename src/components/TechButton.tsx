import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "danger";
  loading?: boolean;
}

export const TechButton = ({
  title,
  onPress,
  variant = "primary",
  loading,
}: Props) => {
  const styles =
    variant === "primary"
      ? "bg-tech-primary border-tech-primary"
      : "bg-tech-danger border-tech-danger";
  const textStyles = variant === "primary" ? "text-tech-bg" : "text-white";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
      className={`w-full py-4 rounded-xl flex-row justify-center items-center border ${styles} shadow-lg`}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text
          className={`font-bold text-lg tracking-widest uppercase ${textStyles}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
