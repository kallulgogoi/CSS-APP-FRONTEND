import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Developer() {
  const router = useRouter();
  const developers = [
    {
      id: 1,
      name: "Kallul Gogoi",
      role: "Full Stack Developer",
      avatar:
        "https://res.cloudinary.com/dig1vxljf/image/upload/v1769251835/myself1_-_Kallul_Gogoi_ccrvj1.jpg",
      instagram: "https://www.instagram.com/kallul_gogoi33/",
      linkedin: "https://www.linkedin.com/in/kallul-gogoi-00a5152a0/",
    },
    {
      id: 2,
      name: "Nibir Deka",
      role: "Full Stack Developer",
      avatar:
        "https://res.cloudinary.com/dig1vxljf/image/upload/v1769250954/Nibir_f3dzpn.jpg",
      instagram: "https://www.instagram.com/nibir_deka_07/",
      linkedin: "https://www.linkedin.com/in/nibir-deka-0a8636331/",
    },
  ];

  const openLink = async (url: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Failed to open URL:", err);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row items-center mb-8 mt-2">
          <View>
            <Text className="text-white text-3xl font-bold">
              The Development Team
            </Text>
            <Text className="text-tech-muted text-xs font-bold tracking-widest uppercase">
              Brains behind the code
            </Text>
          </View>
        </View>

        {/* Developers List */}
        <View className="gap-6">
          {developers.map((dev) => (
            <View
              key={dev.id}
              className="bg-tech-card p-6 rounded-3xl border border-tech-border relative overflow-hidden"
            >
              <View className="absolute -right-10 -top-10 w-32 h-32 bg-tech-primary/10 rounded-full blur-2xl" />

              <View className="flex-row items-center">
                {/* Avatar */}
                <View className="p-1 rounded-full border border-tech-primary/50 mr-4">
                  <Image
                    source={{ uri: dev.avatar }}
                    className="w-20 h-20 rounded-full bg-black"
                  />
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold">
                    {dev.name}
                  </Text>
                  <Text className="text-tech-primary text-xs font-bold uppercase tracking-wider mb-3">
                    {dev.role}
                  </Text>

                  {/* Social Icons Row */}
                  <View className="flex-row gap-3">
                    {/* Instagram */}
                    <TouchableOpacity
                      onPress={() => openLink(dev.instagram)}
                      className="bg-pink-500/10 p-2 rounded-lg border border-pink-500/30"
                    >
                      <Ionicons
                        name="logo-instagram"
                        size={20}
                        color="#E1306C"
                      />
                    </TouchableOpacity>

                    {/* LinkedIn */}
                    <TouchableOpacity
                      onPress={() => openLink(dev.linkedin)}
                      className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/30"
                    >
                      <Ionicons
                        name="logo-linkedin"
                        size={20}
                        color="#0077b5"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View className="mt-12 items-center">
          <Text className="text-tech-muted text-md">
            Designed & Developed By Gogoi Da & Deka Da
          </Text>
          <Text className="text-tech-muted/50 text-md mt-1">v1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
