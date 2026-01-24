import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from "@react-native-google-signin/google-signin";
import { api } from "../constants";
import { useRouter, useSegments } from "expo-router";

export interface User {
  _id: string;
  name: string;
  email: string;
  points: number;
  scholarId?: string;
  role: "USER" | "ADMIN";
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: false,
    });
    checkLocalUser();
  }, []);
  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && !user.scholarId) {
      router.replace("/(auth)/onboarding");
    } else if (user && user.scholarId && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [user, isLoading, segments]);

  const checkLocalUser = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (token && userInfo) setUser(JSON.parse(userInfo));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.data) {
        await handleBackendLogin(response.data.user);
      } else {
        // @ts-ignore
        if (response.user) await handleBackendLogin(response.user);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
      } else {
        console.error("Login Error:", error);
        alert("Google Sign-In failed.");
      }
    }
  };

  const handleBackendLogin = async (googleUser: GoogleUser["user"]) => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/google", {
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        profilePicture: googleUser.photo,
      });

      const { token, user: backendUser } = res.data;

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(backendUser));
      setUser(backendUser);
    } catch (error: any) {
      console.error("Backend Auth Error:", error);
      const message = error.response?.data?.message || "Login Failed.";
      alert(message);
      await GoogleSignin.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      await GoogleSignin.signOut();
      setUser(null);
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...data };
    setUser(newUser);
    await AsyncStorage.setItem("userInfo", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
