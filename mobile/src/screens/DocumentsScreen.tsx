import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getDocuments, uploadDocument } from "../api";
import { Badge, Card, PrimaryButton, Screen, styles } from "../components";
import type { DocumentRecord } from "../types";

export function DocumentsScreen() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    setDocuments(await getDocuments());
  }

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, []);

  async function pickAndUpload() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    setUploading(true);
    try {
      await uploadDocument({ uri: file.uri, name: file.name, mimeType: file.mimeType });
      await refresh();
      Alert.alert("Upload complete", "Document was ingested through the backend pipeline.");
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : "Could not upload document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView>
      <Screen title="Document Ingestion" subtitle="Upload field evidence from mobile and review indexed source documents.">
        <PrimaryButton label="Select and Upload Document" loading={uploading} onPress={pickAndUpload} />
        <View style={{ gap: 12 }}>
          {documents.slice(0, 20).map((doc) => (
            <Card key={doc.id}>
              <Text style={styles.body}>{doc.filename}</Text>
              <View style={{ marginTop: 8 }}>
                <Badge label={doc.doc_type} />
              </View>
              <Text style={styles.muted}>{doc.created_at}</Text>
            </Card>
          ))}
        </View>
      </Screen>
    </ScrollView>
  );
}
