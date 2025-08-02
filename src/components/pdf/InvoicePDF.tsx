// /components/pdf/InvoicePDF.tsx
'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  title: { fontSize: 20, marginBottom: 10 },
  bold: { fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
});

const InvoicePDF = ({ data }: { data: any }) => {
  const {
    bookingId,
    user,
    provider,
    service,
    totalAmount,
    paymentStatus,
    paymentMethod,
    createdAt,
    serviceCustomer,
  } = data;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Service Invoice</Text>

        <View style={styles.section}>
          <Text style={styles.bold}>Booking ID: </Text>
          <Text>{bookingId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Date: </Text>
          <Text>{new Date(createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Customer:</Text>
          <Text>{user?.name} ({user?.phone})</Text>
          <Text>{serviceCustomer?.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Provider:</Text>
          <Text>{provider?.name} ({provider?.phone})</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>Service:</Text>
          <Text>{service?.name}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.bold}>Subtotal:</Text>
            <Text>₹{data.subtotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Discount:</Text>
            <Text>- ₹{data.serviceDiscount + data.couponDiscount + data.champaignDiscount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>GST:</Text>
            <Text>₹{data.serviceGSTPrice}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Platform Fee:</Text>
            <Text>₹{data.platformFeePrice}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Assurity Charges:</Text>
            <Text>₹{data.assurityChargesPrice}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.bold, { fontSize: 14 }]}>Total Amount:</Text>
          <Text style={{ fontSize: 14 }}>₹{totalAmount}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>Payment Method: {paymentMethod.join(", ")}</Text>
          <Text>Payment Status: {paymentStatus}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
