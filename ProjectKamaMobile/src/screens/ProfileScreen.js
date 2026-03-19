// src/screens/ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
export default function ProfileScreen({ authActions }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 ProfileScreen (TP7)</Text>
      {/* Bouton déconnexion déjà branché */}
      <TouchableOpacity style={styles.button} onPress={authActions.signOut}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, color: "#2c3e50", marginBottom: 30 },
  button: {
    backgroundColor: "#e74c3c", paddingHorizontal: 30,
    paddingVertical: 12, borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});