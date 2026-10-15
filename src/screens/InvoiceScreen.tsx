import React, { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { generatePDF } from 'react-native-html-to-pdf';
import { InvoiceScreenNavigationProp, InvoiceScreenRouteProp } from '../types/navigationTypes';
import { SafeAreaView } from 'react-native-safe-area-context';

const InvoiceScreen = ({ route, navigation }: { route: InvoiceScreenRouteProp, navigation: InvoiceScreenNavigationProp }) => {
    const { orderId, product, price, quantity, totalPrice } = route.params;
    const [downloading, setDownloading] = useState(false);
    const invoiceNumber = `INV-${orderId.substring(0, 8).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleDownloadInvoice = async () => {
        if (downloading) {
            return;
        }

        try {
            setDownloading(true);

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 30px;
                            color: #20222A;
                        }

                        .header {
                            display: flex;
                            justify-content: space-between;
                            border-bottom: 2px solid #4263EB;
                            padding-bottom: 20px;
                        }

                        .title {
                            font-size: 28px;
                            font-weight: bold;
                            color: #4263EB;
                        }

                        .invoice-info {
                            text-align: right;
                            font-size: 12px;
                            color: #666666;
                        }

                        .section {
                            margin-top: 30px;
                        }

                        .section-title {
                            font-size: 16px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }

                        .product {
                            border: 1px solid #dddddd;
                            padding: 15px;
                        }

                        .row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                        }

                        .label {
                            color: #666666;
                        }

                        .value {
                            font-weight: bold;
                        }

                        .divider {
                            border-top: 1px solid #dddddd;
                            margin: 15px 0;
                        }

                        .total {
                            font-size: 20px;
                            font-weight: bold;
                            color: #4263EB;
                        }

                        .footer {
                            margin-top: 50px;
                            text-align: center;
                            color: #777777;
                            font-size: 12px;
                        }
                    </style>
                </head>

                <body>

                    <div class="header">
                        <div>
                            <div class="title">INVOICE</div>
                            <div>eCommerce App</div>
                        </div>

                        <div class="invoice-info">
                            <div><b>Invoice No:</b> ${invoiceNumber}</div>
                            <div><b>Date:</b> ${invoiceDate}</div>
                            <div><b>Order ID:</b> ${orderId}</div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Product Details</div>

                        <div class="product">
                            <div class="row">
                                <span class="label">Product</span>
                                <span class="value">${product.name}</span>
                            </div>

                            <div class="row">
                                <span class="label">Price</span>
                                <span class="value">₹${price}</span>
                            </div>

                            <div class="row">
                                <span class="label">Quantity</span>
                                <span class="value">${quantity}</span>
                            </div>

                            <div class="divider"></div>

                            <div class="row">
                                <span>Total</span>
                                <span class="total">₹${totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Payment Summary</div>

                        <div class="row">
                            <span class="label">Subtotal</span>
                            <span class="value">₹${totalPrice}</span>
                        </div>

                        <div class="divider"></div>

                        <div class="row">
                            <span>Total Amount</span>
                            <span class="total">₹${totalPrice}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for your order!</p>
                    </div>

                </body>
                </html>
            `;

            const file = await generatePDF({ html, fileName: `Invoice_${invoiceNumber}`, directory: 'Documents' });
            if (file.filePath) {
                Alert.alert('Invoice Downloaded', file.filePath,
                    [{ text: 'Contine Shopping', onPress: ()=> navigation.navigate('ProductList')}],
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to generate invoice PDF.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButtonHeader}
                    activeOpacity={0.7}
                    onPress={() => { navigation.goBack()}}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Invoice</Text>
                    <Text style={styles.headerSubtitle}>Order invoice</Text>
                </View>
            </View>

            <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.storeName}>eCommerce App</Text>
                    </View>

                    <View style={styles.invoiceMeta}>
                        <Text style={styles.invoiceMetaLabel}>Invoice No.</Text>
                        <Text style={styles.invoiceMetaValue}>{invoiceNumber}</Text>
                        <Text style={styles.invoiceMetaLabel}>Date</Text>
                        <Text style={styles.invoiceMetaValue}>{invoiceDate}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.orderSection}>
                    <Text style={styles.sectionTitle}>Order Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order ID</Text>
                        <Text style={styles.infoValue}>{orderId}</Text>
                    </View>
                </View>

                <View style={styles.productSection}>
                    <Text style={styles.sectionTitle}>Product Details</Text>
                    <View style={styles.productRow}>
                        <View style={styles.productDetails}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productPrice}>₹{price}</Text>
                        </View>
                        <View style={styles.quantityBadge}>
                            <Text style={styles.quantityBadgeText}>Qty: {quantity}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Product Price</Text>
                        <Text style={styles.summaryValue}>₹{price}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Quantity</Text>
                        <Text style={styles.summaryValue}>{quantity}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{totalPrice}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.downloadBottomButton, downloading && styles.downloadBottomButtonDisabled]}
                    activeOpacity={0.8}
                    disabled={downloading}
                    onPress={handleDownloadInvoice}>

                    {downloading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.downloadBottomText}> Download Invoice PDF</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.thankYouContainer}>
                    <Text style={styles.thankYou}>Thank you for your order!</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 18,
        borderBottomWidth: 2,
        borderBottomColor: '#EEEEF2',
    },

    backButtonHeader: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#F1F3F8',
        alignItems: 'center',
        justifyContent: 'center',
    },

    backText: {
        fontSize: 32,
        color: '#22242A',
        lineHeight: 34,
        marginTop: -3,
    },

    headerTextContainer: {
        flex: 1,
        marginLeft: 14,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#181A20',
    },

    headerSubtitle: {
        fontSize: 13,
        color: '#858A98',
        marginTop: 3,
    },

    invoiceCard: {
        borderRadius: 20,
        padding: 20,
    },

    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    invoiceTitle: {
        fontSize: 27,
        fontWeight: '900',
        color: '#4263EB',
    },

    storeName: {
        marginTop: 5,
        fontSize: 13,
        color: '#858A98',
    },

    invoiceMeta: {
        alignItems: 'flex-end',
    },

    invoiceMetaLabel: {
        fontSize: 10,
        color: '#858A98',
        marginTop: 2,
    },

    invoiceMetaValue: {
        fontSize: 11,
        fontWeight: '700',
        color: '#20222A',
        marginTop: 2,
    },

    divider: {
        height: 1,
        backgroundColor: '#ECEEF2',
        marginVertical: 18,
    },

    orderSection: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#20222A',
        marginBottom: 12,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    infoLabel: {
        fontSize: 13,
        color: '#858A98',
    },

    infoValue: {
        flex: 1,
        textAlign: 'right',
        marginLeft: 15,
        fontSize: 12,
        fontWeight: '700',
        color: '#20222A',
    },

    productSection: {
        marginBottom: 5,
    },

    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#F6F7FB',
    },

    productDetails: {
        flex: 1,
        marginRight: 10,
    },

    productName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#20222A',
    },

    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4263EB',
        marginTop: 5,
    },

    quantityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },

    quantityBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#20222A',
    },

    summarySection: {
        marginTop: 3,
        marginBottom: 18,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    summaryLabel: {
        fontSize: 13,
        color: '#858A98',
    },

    summaryValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#20222A',
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalLabel: {
        fontSize: 17,
        fontWeight: '800',
        color: '#20222A',
    },

    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#4263EB',
    },

    thankYouContainer: {
        alignItems: 'center',
        marginTop: 15,
    },

    thankYou: {
        fontSize: 14,
        fontWeight: '800',
        color: '#20222A',
    },

    thankYouSubtext: {
        fontSize: 11,
        color: '#858A98',
        marginTop: 5,
    },

    downloadBottomButton: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#4263EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    downloadBottomButtonDisabled: {
        opacity: 0.7,
    },

    downloadBottomText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F7FB',
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#20222A',
    },

    backButton: {
        height: 50,
        paddingHorizontal: 25,
        marginTop: 20,
        borderRadius: 14,
        backgroundColor: '#4263EB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});

export default InvoiceScreen;