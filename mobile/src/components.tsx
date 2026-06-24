import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Industrial Brain AI</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function MetricCard({ label, value, detail, tone = "info" }: { label: string; value: string | number; detail?: string; tone?: "info" | "success" | "warning" | "critical" }) {
  const toneColor = tone === "critical" ? colors.critical : tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.secondary;
  return (
    <Card>
      <View style={[styles.metricStripe, { backgroundColor: toneColor }]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {detail ? <Text style={styles.muted}>{detail}</Text> : null}
    </Card>
  );
}

export function Badge({ label, tone = "info" }: { label: string; tone?: "info" | "success" | "warning" | "critical" }) {
  const toneColor = tone === "critical" ? colors.critical : tone === "warning" ? colors.warning : tone === "success" ? colors.success : colors.secondary;
  return <Text style={[styles.badge, { borderColor: toneColor, color: toneColor }]}>{label}</Text>;
}

export function PrimaryButton({ label, loading, onPress }: { label: string; loading?: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={loading} onPress={onPress} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 14,
    padding: 18,
    backgroundColor: colors.bg
  },
  eyebrow: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  card: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    padding: 16
  },
  metricStripe: {
    height: 4,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 14
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13
  },
  metricValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "800"
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 16
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    color: colors.text,
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 14
  }
});
