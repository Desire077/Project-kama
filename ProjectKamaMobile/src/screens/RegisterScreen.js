// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import api from "../api/axiosConfig";
import { saveToken } from "../utils/tokenStorage";

export default function RegisterScreen({ navigation, authActions }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Prénom, email et mot de passe sont requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      const { token, user } = response.data;
      await saveToken(token);

      // Informer le RootNavigator → redirection automatique vers AppStack
      authActions.signIn(token);

    } catch (error) {
      if (error.response) {
        Alert.alert("Erreur", error.response.data.message);
      } else {
        Alert.alert("Erreur réseau", "Impossible de joindre le serveur.");
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Project Kama</Text>

        <TextInput
          style={styles.input} placeholder="Prénom *"
          value={firstName} onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input} placeholder="Nom"
          value={lastName} onChangeText={setLastName}
        />
        <TextInput
          style={styles.input} placeholder="Adresse e-mail *"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Mot de passe *"
          value={password} onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister} disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>
            Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: {
    flexGrow: 1, justifyContent: "center",
    alignItems: "center", paddingHorizontal: 30, paddingVertical: 50,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#2c3e50", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#7f8c8d", marginBottom: 30 },
  input: {
    width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 15, fontSize: 16, marginBottom: 15,
    borderWidth: 1, borderColor: "#ddd",
  },
  button: {
    width: "100%", height: 50, backgroundColor: "#27ae60", borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#95a5a6" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#7f8c8d", fontSize: 14, marginTop: 20 },
  linkBold: { color: "#3498db", fontWeight: "bold" },
});