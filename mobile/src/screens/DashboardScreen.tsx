import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDashboard } from "../api";
import { Card, MetricCard, Screen, styles } from "../components";
import { colors } from "../theme";
import type { DashboardResponse } from "../types";

type ModuleKey = "documents" | "copilot" | "assets" | "compliance" | "reports";

const modules: Array<{ key: ModuleKey; label: string; detail: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: "copilot", label: "Ask Copilot", detail: "Source-cited answers", icon: "sparkles-outline" },
  { key: "documents", label: "Documents", detail: "Upload and review", icon: "document-text-outline" },
  { key: "assets", label: "Asset 360", detail: "Risk and history", icon: "hardware-chip-outline" },
  { key: "compliance", label: "Compliance", detail: "Audit gaps", icon: "shield-checkmark-outline" },
  { key: "reports", label: "Reports", detail: "PDF downloads", icon: "download-outline" }
];

export function DashboardScreen({ onNavigate }: { onNavigate: (tab: ModuleKey) => void }) {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    void getDashboard().then(setData).catch(() => setData(null));
  }, []);

  const citation = Math.round((data?.metrics.citation_coverage || 0) * 100);

  return (
    <ScrollView>
      <Screen title="Plant Intelligence Cockpit" subtitle="Mobile command view for maintenance, reliability, compliance, and plant leadership.">
        <View style={{ gap: 12 }}>
          <MetricCard label="Documents" value={data?.documents ?? "-"} detail={`${data?.chunks ?? 0} chunks indexed`} />
          <MetricCard label="Entities" value={data?.entities ?? "-"} detail="Extracted from uploaded evidence" tone="success" />
          <MetricCard label="Compliance Gaps" value={data?.metrics.compliance_gaps_found ?? "-"} detail="Open audit exceptions" tone="warning" />
          <MetricCard label="Citation Coverage" value={`${citation}%`} detail="AI answers with source evidence" tone={citation >= 80 ? "success" : "warning"} />
          <Card>
            <Text style={styles.body}>High-risk assets: {data?.maintenance.high_risk_assets.length ?? 0}</Text>
            <Text style={styles.muted}>Repeated patterns: {data?.metrics.repeated_failure_patterns_detected ?? 0}</Text>
          </Card>
          <Card>
            <Text style={styles.eyebrow}>Open Module</Text>
            <View style={{ gap: 10, marginTop: 10 }}>
              {modules.map((module) => (
                <Pressable
                  key={module.key}
                  onPress={() => onNavigate(module.key)}
                  style={({ pressed }) => ({
                    minHeight: 58,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: pressed ? "rgba(59,130,246,0.24)" : "rgba(255,255,255,0.06)",
                    paddingHorizontal: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 12
                  })}
                >
                  <Ionicons name={module.icon} size={22} color={colors.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.body}>{module.label}</Text>
                    <Text style={styles.muted}>{module.detail}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </Card>
        </View>
      </Screen>
    </ScrollView>
  );
}
