import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 1. Import this

export default function NotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 2. Get safe area insets

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/my");
      setNotifications(res.data);
    } catch (error) {
      console.log("Error fetching notifications", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    } catch (e) {
      console.log(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return { name: "checkmark-circle", color: "#4ade80" };
      case "WARNING":
        return { name: "alert-circle", color: "#fbbf24" };
      case "ERROR":
        return { name: "close-circle", color: "#f87171" };
      default:
        return { name: "information-circle", color: "#60a5fa" };
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4 mb-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-xl">Notifications</Text>
          </View>
          <TouchableOpacity onPress={markAllRead}>
            <Text className="text-cyan-400 text-sm font-bold">
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00d4ff" className="mt-10" />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item: any) => item._id}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchNotifications();
                }}
                tintColor="#00d4ff"
              />
            }
            ListEmptyComponent={
              <View className="items-center mt-20 opacity-50">
                <Ionicons
                  name="notifications-off-outline"
                  size={48}
                  color="gray"
                />
                <Text className="text-gray-400 mt-4">No notifications yet</Text>
              </View>
            }
            renderItem={({ item }) => {
              const icon = getIcon(item.type);
              return (
                <View
                  className={`mb-3 p-4 rounded-xl border ${
                    item.read
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-neutral-800 border-neutral-700"
                  }`}
                >
                  <View className="flex-row">
                    <View className="mt-1 mr-3">
                      {/* @ts-ignore */}
                      <Ionicons name={icon.name} size={24} color={icon.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between">
                        <Text
                          className={`font-bold text-base mb-1 ${
                            item.read ? "text-gray-400" : "text-white"
                          }`}
                        >
                          {item.title}
                        </Text>
                        {!item.read && (
                          <View className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                        )}
                      </View>
                      <Text className="text-gray-400 text-sm leading-5">
                        {item.message}
                      </Text>
                      <Text className="text-gray-600 text-xs mt-2">
                        {new Date(item.createdAt).toLocaleDateString()} •{" "}
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
