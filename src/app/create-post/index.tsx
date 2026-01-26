import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../constants";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !image)
      return Alert.alert("Hold up!", "A post needs text or an image.");

    const formData = new FormData();
    formData.append("content", content);

    if (image) {
      const uriParts = image.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: image.uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      setUploading(true);
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Link Failed",
        error.response?.data?.error || "Could not synchronize post",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 px-6">
        <View className="flex-row justify-between items-center py-4 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-neutral-900 rounded-full border border-neutral-800"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-black text-xl">NEW POST</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={uploading}
            className={`px-6 py-2 rounded-full ${uploading ? "bg-gray-800" : "bg-tech-primary"}`}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text className="text-black font-black">POST</Text>
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          multiline
          placeholder="What's the status in the arena?"
          placeholderTextColor="#64748b"
          className="text-white text-lg min-h-[120px] bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        {image && (
          <View className="relative mt-6 rounded-2xl overflow-hidden border border-tech-border">
            <Image source={{ uri: image.uri }} className="w-full h-80" />
            <TouchableOpacity
              onPress={() => setImage(null)}
              className="absolute top-3 right-3 bg-black/70 p-2 rounded-full"
            >
              <Ionicons name="trash" size={20} color="#f87171" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={pickImage}
          className="flex-row items-center mt-8 self-start bg-neutral-900 px-6 py-4 rounded-2xl border border-neutral-800"
        >
          <Ionicons name="image" size={28} color="#06b6d4" />
          <Text className="text-tech-primary ml-3 font-black tracking-widest uppercase text-xs">
            Attach Media
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
