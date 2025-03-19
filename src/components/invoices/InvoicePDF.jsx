import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '../../utils/formatUtils';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  logo: {
    width: 60,
    height: 60
  },
  headerRight: {
    textAlign: 'right'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  invoiceInfo: {
    marginBottom: 5
  },
  status: {
    padding: 5,
    borderRadius: 4,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  statusPaid: {
    backgroundColor: '#e6f7e6',
    color: '#2e7d32'
  },
  statusUnpaid: {
    backgroundColor: '#fdecea',
    color: '#d32f2f'
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 10
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 8
  },
  colProduct: {
    width: '40%'
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center'
  },
  colPrice: {
    width: '20%',
    textAlign: 'right'
  },
  colTotal: {
    width: '25%',
    textAlign: 'right'
  },
  productBarcode: {
    fontSize: 9,
    color: '#757575',
    marginTop: 2
  },
  summary: {
    marginTop: 20,
    textAlign: 'right'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 2
  },
  summaryLabel: {
    width: 100
  },
  summaryValue: {
    width: 100,
    textAlign: 'right'
  },
  summaryTotal: {
    fontWeight: 'bold',
    fontSize: 13
  },
  footer: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 10,
    color: '#757575'
  }
});

/**
 * InvoicePDF component
 * Creates a PDF document for an invoice
 */
const InvoicePDF = ({ invoice, invoiceItems }) => {
  // Calculate subtotal
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>POS System</Text>
            <Text>123 Business Street</Text>
            <Text>City, Country</Text>
            <Text>Phone: +1 234 567 890</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.title}>Invoice #{invoice.id}</Text>
            <Text style={styles.invoiceInfo}>Date: {formatDate(invoice.date, 'date')}</Text>
            <Text style={styles.invoiceInfo}>Time: {formatDate(invoice.date, 'time')}</Text>
            <Text 
              style={[
                styles.status,
                invoice.paymentStatus ? styles.statusPaid : styles.statusUnpaid
              ]}
            >
              {invoice.paymentStatus ? 'PAID' : 'UNPAID'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Invoice Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Product</Text>
            <Text style={styles.colQuantity}>Quantity</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          
          {invoiceItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text>{item.name}</Text>
                <Text style={styles.productBarcode}>{item.barcode}</Text>
              </View>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.summaryTotal]}>Total:</Text>
            <Text style={[styles.summaryValue, styles.summaryTotal]}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;