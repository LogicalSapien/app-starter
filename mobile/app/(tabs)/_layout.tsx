import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";

type TabIconProps = {
  label: string;
  focused: boolean;
};

function TabIcon({ label, focused }: TabIconProps) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>{label}</Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        },
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerShadowVisible: false,
        headerTintColor: "#111827",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="H" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon label="P" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon label="S" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    color: "#6B7280",
    fontSize: 18,
    fontWeight: "700",
  },
  iconFocused: {
    color: "#2563EB",
  },
});
