// src/navigation/AppStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PropertyDetailScreen from "../screens/PropertyDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppStack({ authActions }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#3498db" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="Home"
        options={{ title: "Biens immobiliers" }}
      >
        {(props) => <HomeScreen {...props} authActions={authActions} />}
      </Stack.Screen>
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: "Détail du bien" }}
      />
      <Stack.Screen
        name="Profile"
        options={{ title: "Mon profil" }}
      >
        {(props) => <ProfileScreen {...props} authActions={authActions} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}