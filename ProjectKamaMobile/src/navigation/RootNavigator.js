// src/navigation/RootNavigator.js
import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { getToken, removeToken } from "../utils/tokenStorage";
import api from "../api/axiosConfig";

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();

        if (token) {
          // ⚠️ Spécifique à ton cas : vérifier que le token est encore valide
          // sur kama-ga.cloud (token potentiellement expiré si l'app n'a pas
          // été utilisée depuis longtemps)
          try {
            await api.get("/auth/me"); // route protégée pour valider le token
            setUserToken(token);       // token OK → on connecte l'utilisateur
          } catch (error) {
            if (error.response?.status === 401) {
              // Token expiré ou invalide → on nettoie et on renvoie au login
              await removeToken();
              setUserToken(null);
            } else {
              // Autre erreur (réseau, serveur) → on garde le token
              // pour ne pas déconnecter l'utilisateur si Hostinger est lent
              setUserToken(token);
            }
          }
        } else {
          setUserToken(null);
        }
      } catch (error) {
        console.error("Erreur lecture token:", error);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const authActions = {
    signIn: (token) => setUserToken(token),
    signOut: async () => {
      await removeToken();
      setUserToken(null);
    },
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? (
        <AppStack authActions={authActions} />
      ) : (
        <AuthStack authActions={authActions} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});