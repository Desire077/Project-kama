import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";

import api from "../api/axiosConfig";
import { saveToken } from "../utils/tokenStorage";

export default function LoginScreen({ navigation, authActions }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    return;
  }

  setLoading(true);
  try {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password: password,
    });

    const { token, user } = response.data;
    await saveToken(token);
    await saveToken(token);
    authActions.signIn(token);
    Alert.alert("Connexion réussie", `Bienvenue ${user.firstName} !`);
    console.log("Token reçu :", token);
    console.log("Utilisateur :", user);

    // TODO TP5 : navigation vers l'écran principal

  } catch (error) {
    if (error.response) {
      Alert.alert("Erreur", error.response.data.message);
    } else if (error.request) {
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
    } else {
      Alert.alert("Erreur", "Une erreur inattendue est survenue.");
    }
  } finally {
    setLoading(false);
  }
}; 

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Project Kama</Text>
      <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => Alert.alert("Info", "L'inscription sera implémentée au TP5.")}
      >
        <Text style={styles.linkText}>
          Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#f8f9fa", paddingHorizontal: 30,
  },
  title: { fontSize: 32, fontWeight: "bold", color: "#2c3e50", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#7f8c8d", marginBottom: 40 },
  input: {
    width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 15, fontSize: 16, marginBottom: 15,
    borderWidth: 1, borderColor: "#ddd",
  },
  button: {
    width: "100%", height: 50, backgroundColor: "#3498db", borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#95a5a6" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkContainer: { marginTop: 20 },
  linkText: { color: "#7f8c8d", fontSize: 14 },
  linkBold: { color: "#3498db", fontWeight: "bold" },
});