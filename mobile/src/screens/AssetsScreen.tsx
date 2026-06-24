import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getAssets } from "../api";
import { Badge, Card, Screen, styles } from "../components";
import type { BackendAsset } from "../types";

function riskTone(score: number): "success" | "warning" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 65) return "warning";
  return "success";
}

export function AssetsScreen() {
  const [assets, setAssets] = useState<BackendAsset[]>([]);

  useEffect(() => {
    void getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  return (
    <ScrollView>
      <Screen title="Asset 360 Mobile" subtitle="Field-friendly asset risk, status, and reliability context.">
        <View style={{ gap: 12 }}>
          {assets.map((asset) => {
            const risk = Number(asset.risk_score ?? 0);
            return (
              <Card key={asset.tag}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.body}>{asset.tag} - {asset.name}</Text>
                    <Text style={styles.muted}>{asset.asset_type} - {asset.location}</Text>
                  </View>
                  <Badge label={`Risk ${risk}`} tone={riskTone(risk)} />
                </View>
                <Text style={[styles.muted, { marginTop: 10 }]}>Status: {asset.status || "Indexed"}</Text>
              </Card>
            );
          })}
        </View>
      </Screen>
    </ScrollView>
  );
}
