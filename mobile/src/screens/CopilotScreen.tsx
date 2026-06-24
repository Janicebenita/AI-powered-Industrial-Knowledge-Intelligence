import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { askCopilot } from "../api";
import { Card, PrimaryButton, Screen, styles } from "../components";
import type { CopilotResponse } from "../types";

export function CopilotScreen() {
  const [question, setQuestion] = useState("Why has Pump P101 failed repeatedly?");
  const [answer, setAnswer] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      setAnswer(await askCopilot(question));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView>
      <Screen title="AI Knowledge Copilot" subtitle="Ask source-cited operational questions from the field.">
        <TextInput value={question} onChangeText={setQuestion} placeholder="Ask about assets, SOPs, failures..." placeholderTextColor="#64748B" style={styles.input} />
        <PrimaryButton label="Ask Copilot" loading={loading} onPress={ask} />
        {answer ? (
          <View style={{ gap: 12 }}>
            <Card>
              <Text style={styles.eyebrow}>Recommended SOP:</Text>
              <Text style={styles.body}>{answer.related_documents.find((doc) => /sop|procedure|loto/i.test(doc)) || "Use cited evidence before field execution"}</Text>
            </Card>
            <Card>
              <Text style={styles.eyebrow}>Reason:</Text>
              <Text style={styles.body}>{answer.direct_answer}</Text>
            </Card>
            <Card>
              <Text style={styles.eyebrow}>Evidence:</Text>
              {answer.citations.map((citation, index) => <Text key={index} style={styles.muted}>{citation.filename}: {citation.quote}</Text>)}
            </Card>
            <Card>
              <Text style={styles.eyebrow}>Related Assets:</Text>
              <Text style={styles.body}>{answer.related_assets.join(", ") || "No asset detected"}</Text>
            </Card>
            <Card>
              <Text style={styles.eyebrow}>Confidence:</Text>
              <Text style={styles.body}>{Math.round(answer.confidence * 100)}% - {answer.evidence_strength}</Text>
            </Card>
          </View>
        ) : null}
      </Screen>
    </ScrollView>
  );
}
