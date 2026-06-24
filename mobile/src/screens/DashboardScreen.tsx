import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getDashboard } from "../api";
import { Card, MetricCard, Screen, styles } from "../components";
import type { DashboardResponse } from "../types";

export function DashboardScreen() {
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
        </View>
      </Screen>
    </ScrollView>
  );
}
