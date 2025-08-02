// components/pdf/InvoiceDocument.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
});

export function createInvoiceDocument(data: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Invoice ID: {data.bookingId}</Text>
          <Text>Total Amount: ₹{data.totalAmount}</Text>
          <Text>Status: {data.paymentStatus}</Text>
        </View>
      </Page>
    </Document>
  );
}
