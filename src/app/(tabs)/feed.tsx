import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { api } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";

export default function SocialFeed() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (error) {
      console.error("Feed Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, []),
  );

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(user?._id);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id: string) => id !== user?._id)
                : [...post.likes, user?._id],
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.log("Like error", error);
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View className="bg-[#0f172a] border border-[#1e293b] rounded-3xl mb-5 overflow-hidden mx-4 shadow-xl">
      {/* Header */}
      <View className="flex-row items-center p-4">
        <Image
          source={{ uri: item.user?.profilePicture }}
          className="w-12 h-12 rounded-full border border-[#06b6d4]"
        />
        <View className="ml-3 flex-1">
          <Text className="text-white font-bold text-base">
            @{item.user?.username}
          </Text>
          <Text className="text-slate-500 text-[11px] uppercase tracking-tighter">
            {moment(item.createdAt).fromNow()}
          </Text>
        </View>
        <View className="bg-[#1e293b] px-3 py-1 rounded-full">
          <Text className="text-[#06b6d4] text-[10px] font-black italic">
            ID: {item.user?.scholarId || "USR"}
          </Text>
        </View>
      </View>

      {/* Content */}
      {item.content && (
        <Text className="text-slate-200 px-5 pb-4 leading-6 text-[15px]">
          {item.content}
        </Text>
      )}

      {item.image && (
        <Image
          source={{ uri: item.image }}
          className="w-full h-80 bg-black"
          resizeMode="cover"
        />
      )}

      {/* Footer Actions */}
      <View className="flex-row items-center justify-between p-4 bg-[#1e293b]/20 border-t border-[#1e293b]">
        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleLike(item._id)}
            className="flex-row items-center mr-6"
          >
            <Ionicons
              name={item.likes.includes(user?._id) ? "heart" : "heart-outline"}
              size={26}
              color={item.likes.includes(user?._id) ? "#ef4444" : "#94a3b8"}
            />
            <Text className="text-white ml-2 font-bold">
              {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(`/post/${item._id}`)}
            className="flex-row items-center"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#94a3b8"
            />
            <Text className="text-white ml-2 font-bold">
              {item.comments?.length || 0}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-[#020617]">
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <View>
            <Text className="text-white text-3xl font-black italic tracking-tighter">
              COMMUNITY
            </Text>
            <Text className="text-[#06b6d4] text-[10px] font-black tracking-[3px] uppercase">
              Nexus Network
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/create-post")}
            className="bg-[#06b6d4] h-14 w-14 items-center justify-center rounded-2xl rotate-45 shadow-lg shadow-cyan-500/50"
          >
            <View className="-rotate-45">
              <Ionicons name="add" size={32} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#06b6d4" size="large" className="mt-20" />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={renderPost}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchPosts}
                tintColor="#06b6d4"
              />
            }
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}
