import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getCompliance } from "../api";
import { Badge, Card, MetricCard, Screen, styles } from "../components";
import type { ComplianceResponse } from "../types";

export function ComplianceScreen() {
  const [compliance, setCompliance] = useState<ComplianceResponse | null>(null);

  useEffect(() => {
    void getCompliance().then(setCompliance).catch(() => setCompliance(null));
  }, []);

  const score = useMemo(() => {
    const covered = compliance?.covered.length ?? 0;
    const gaps = compliance?.gaps.length ?? 0;
    return covered + gaps ? Math.round((covered / (covered + gaps)) * 100) : 0;
  }, [compliance]);

  return (
    <ScrollView>
      <Screen title="Compliance Cockpit" subtitle="Mobile audit readiness, missing evidence, and regulation-to-document gaps.">
        <MetricCard label="Compliance Score" value={`${score}%`} detail={compliance?.audit_summary || "No compliance data"} tone={score >= 80 ? "success" : "warning"} />
        <MetricCard label="Missing Evidence" value={compliance?.missing_documents.length ?? 0} detail="Clauses without mapped proof" tone={(compliance?.missing_documents.length ?? 0) ? "critical" : "success"} />
        <View style={{ gap: 12 }}>
          {(compliance?.gaps ?? []).map((gap) => (
            <Card key={gap.clause}>
              <View style={styles.row}>
                <Text style={[styles.body, { flex: 1 }]}>{gap.clause}</Text>
                <Badge label={gap.evidence.length ? "Partial" : "Gap"} tone={gap.evidence.length ? "warning" : "critical"} />
              </View>
              <Text style={styles.muted}>{gap.applies_to}</Text>
              <Text style={styles.muted}>{gap.requirement}</Text>
            </Card>
          ))}
        </View>
      </Screen>
    </ScrollView>
  );
}
