import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../constants";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostComments() {
  const { postId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/post/${postId}`);
      setComments(res.data.comments);
    } catch (error) {
      console.error("Comment fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSending(true);
      const res = await api.post(`/comments/post/${postId}`, {
        content: newComment,
      });
      const currentUser = user as any;
      setComments([
        {
          ...res.data.comment,
          user: {
            username: currentUser?.username,
            profilePicture: currentUser?.profilePicture,
          },
        },
        ...comments,
      ]);
      setNewComment("");
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert("System Error", "Unable to broadcast signal.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-[#020617]">
        {/* Header */}
        <View className="flex-row items-center px-6 py-5 border-b border-[#1e293b] bg-[#020617]">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.replace("/(tabs)/feed")}
            className="mr-5 bg-[#1e293b] p-2.5 rounded-2xl"
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-black text-2xl tracking-tighter">
              COMMENTS
            </Text>
            <Text className="text-[#06b6d4] text-[10px] font-bold uppercase">
              Be respectful in the comment section
            </Text>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View className="flex-row px-6 py-5 border-b border-[#1e293b]/30">
              <Image
                source={{ uri: item.user?.profilePicture }}
                className="w-12 h-12 rounded-full border-2 border-[#1e293b]"
              />
              <View className="ml-4 flex-1">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-white font-bold text-[15px]">
                    @{item.user?.username}
                  </Text>
                  <Text className="text-slate-500 text-[10px] font-medium">
                    {moment(item.createdAt).fromNow()}
                  </Text>
                </View>
                <Text className="text-slate-200 text-[15px] leading-6 tracking-tight">
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center mt-20 px-10">
                <Ionicons
                  name="chatbubbles-outline"
                  size={60}
                  color="#1e293b"
                />
                <Text className="text-slate-600 text-center mt-4 italic text-lg font-medium">
                  No signals decrypted yet. Start the conversation.
                </Text>
              </View>
            ) : null
          }
        />

        {/* Floating Input Bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: keyboardHeight,
            paddingBottom: insets.bottom + 12,
          }}
          className="p-4 bg-[#020617]/95 border-t border-[#1e293b]"
        >
          <View className="flex-row items-center bg-[#0f172a] rounded-3xl px-4 py-2 border border-[#1e293b]">
            <TextInput
              placeholder="Broadcasting a message..."
              placeholderTextColor="#475569"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              className="flex-1 text-white p-3 font-semibold text-[16px] max-h-24"
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={sending || !newComment.trim()}
              className={`h-12 w-12 items-center justify-center rounded-2xl ${
                sending || !newComment.trim() ? "bg-slate-800" : "bg-[#06b6d4]"
              } shadow-lg`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={22} color="black" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
