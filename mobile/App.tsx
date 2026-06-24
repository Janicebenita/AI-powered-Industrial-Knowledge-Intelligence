import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "./src/theme";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { DocumentsScreen } from "./src/screens/DocumentsScreen";
import { CopilotScreen } from "./src/screens/CopilotScreen";
import { AssetsScreen } from "./src/screens/AssetsScreen";
import { ComplianceScreen } from "./src/screens/ComplianceScreen";
import { ReportsScreen } from "./src/screens/ReportsScreen";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: "speedometer-outline" },
  { key: "documents", label: "Docs", icon: "document-text-outline" },
  { key: "copilot", label: "Copilot", icon: "sparkles-outline" },
  { key: "assets", label: "Assets", icon: "hardware-chip-outline" },
  { key: "compliance", label: "Audit", icon: "shield-checkmark-outline" },
  { key: "reports", label: "Reports", icon: "download-outline" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function App() {
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topbar}>
        <View style={styles.logo}><Text style={styles.logoText}>IB</Text></View>
        <View>
          <Text style={styles.product}>Industrial Brain AI</Text>
          <Text style={styles.status}>Plant A - AI online</Text>
        </View>
      </View>
      <View style={styles.content}>
        {tab === "dashboard" ? <DashboardScreen /> : null}
        {tab === "documents" ? <DocumentsScreen /> : null}
        {tab === "copilot" ? <CopilotScreen /> : null}
        {tab === "assets" ? <AssetsScreen /> : null}
        {tab === "compliance" ? <ComplianceScreen /> : null}
        {tab === "reports" ? <ReportsScreen /> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((item) => {
          const active = item.key === tab;
          return (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={[styles.tab, active && styles.activeTab]}>
              <Ionicons name={item.icon} size={18} color={active ? colors.text : colors.muted} />
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "#071024"
  },
  logo: {
    height: 42,
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primary
  },
  logoText: {
    color: colors.text,
    fontWeight: "900"
  },
  product: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  status: {
    color: colors.muted,
    fontSize: 12
  },
  content: {
    flex: 1
  },
  tabs: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#071024"
  },
  tab: {
    minWidth: 94,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12
  },
  activeTab: {
    backgroundColor: colors.primary
  },
  tabLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12
  },
  activeTabLabel: {
    color: colors.text
  }
});
