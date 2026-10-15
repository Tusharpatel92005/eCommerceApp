import React, { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { cancelOrder, deleteOrder, updateOrderStatus } from '../services/firebase';

import { OrderDetailsScreenNavigationProp, OrderDetailsScreenRouteProp } from '../types/navigationTypes';
import { Order, OrderStatus } from '../types/type';
import { SafeAreaView } from 'react-native-safe-area-context';


const db = getFirestore();
const auth = getAuth();

const statuses: OrderStatus[] = [
    'Order Placed',
    'Processing',
    'Dispatch',
    'Out For Delivery',
    'Order Completed',
];

const OrderDetailsScreen = ({ route, navigation, }: { route: OrderDetailsScreenRouteProp; navigation: OrderDetailsScreenNavigationProp; }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error('User is not logged in');
            }

            const orderRef = doc(db, 'users', user.uid, 'order details', orderId);
            const fetchOrder = await getDoc(orderRef);

            if (!fetchOrder.exists()) {
                throw new Error('Order not found');
            }

            const data = fetchOrder.data();
            const orderData: Order = {
                id: fetchOrder.id,
                productId: data.productId,
                name: data.name,
                images: data.images,
                price: Number(data.price),
                quantity: Number(data.quantity),
                totalPrice: Number(data.totalPrice),
                status: data.status as OrderStatus,
            };

            setOrder(orderData);
        } catch {
            Alert.alert('Error', 'Unable to load order details.');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderReceived = () => {
        Alert.alert(
            'Order Received',
            'Have you received your order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Received',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await updateOrderStatus(orderId, 'Order Completed');
                            setOrder(previousOrder => {
                                if (!previousOrder) {
                                    return previousOrder;
                                }
                                return { ...previousOrder, status: 'Order Completed' };
                            });

                            Alert.alert('Order Completed', 'Your order has been marked as completed.');
                        } catch {
                            Alert.alert('Error', 'Unable to update order status.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await cancelOrder(orderId);
                            setOrder(previousOrder => {
                                if (!previousOrder) {
                                    return previousOrder;
                                }

                                return { ...previousOrder, status: 'Cancelled' };
                            });
                            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.'
                                ,[{ text: 'Ok', onPress: ()=> navigation.goBack()}]
                            );
                        } catch {
                            Alert.alert('Unable to Cancel', 'This order can no longer be cancelled.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const handleDeleteOrder = () => {
        Alert.alert(
            'Delete Order',
            'Are you sure you want to permanently delete this cancelled order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteOrder(orderId);
                            Alert.alert('Order Deleted', 'The order has been deleted successfully.',
                                [{ text: 'OK', onPress: () => { navigation.goBack(); } }],
                                { cancelable: false },
                            );
                        } catch {
                            Alert.alert('Error', 'Unable to delete the order.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const getStatusIndex = () => {
        if (!order) {
            return 0;
        }

        if (order.status === 'Cancelled') {
            return -1;
        }

        const index = statuses.indexOf(order.status);
        return index === -1 ? 0 : index;
    };

    const currentStatusIndex = getStatusIndex();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4263EB" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Order Not Found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <Text style={styles.headerSubtitle}>Track your order</Text>
                </View>

                {order.status === 'Cancelled' ? (
                    <TouchableOpacity
                        style={styles.deleteHeaderButton}
                        activeOpacity={0.7}
                        onPress={handleDeleteOrder}
                    >
                        <Text style={styles.deleteHeaderText}>Delete</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerRightSpace} />
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={styles.orderStatusCard}>
                    <Text style={styles.sectionTitle}>Order Status</Text>
                    <View style={styles.statusContainer}>
                        {statuses.map((status, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;

                            return (
                                <View key={status} style={styles.statusItem}>
                                    <View style={styles.statusLeft}>
                                        <View style={[styles.statusCircle, isCompleted && styles.statusCircleActive]}>
                                            <Text style={[styles.statusCircleText, isCompleted && styles.statusCircleTextActive]}>{isCompleted ? '✓' : index + 1}</Text>
                                        </View>

                                        {index <
                                            statuses.length - 1 && (
                                                <View style={[styles.statusLine, index < currentStatusIndex && styles.statusLineActive]} />
                                            )}
                                    </View>

                                    <View style={styles.statusContent}>
                                        <Text style={[styles.statusTitle, isCurrent && styles.statusTitleActive]}>{status}</Text>
                                        {isCurrent && (
                                            <Text style={styles.currentStatusText}>Current Status</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.productCard}>
                    <Text style={styles.sectionTitle}>Product Details</Text>
                    <View style={styles.productContent}>
                        <View style={styles.imageContainer}>
                            {order.images ? (
                                <Image
                                    source={{ uri: order.images[0] }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text style={styles.imagePlaceholder}> 📦</Text>
                            )}
                        </View>

                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{order.name}</Text>
                            <Text style={styles.productPrice}>₹{order.price}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Product Price</Text>
                        <Text style={styles.summaryValue}>₹{order.price}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Product Quantity</Text>
                        <Text style={styles.summaryValue}>{order.quantity}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Price</Text>
                        <Text style={styles.totalValue}>₹{order.totalPrice}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.invoiceButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate('Invoice', {
                                orderId,
                                product: {
                                    name: order.name,
                                    images: order.images ? [order.images[0]] : [],
                                },
                                price: order.price,
                                quantity: order.quantity,
                                totalPrice: order.totalPrice,
                            });
                        }}
                    >
                        <Text style={styles.invoiceButtonText}>Show Invoice</Text>
                    </TouchableOpacity>
                </View>

                {order.status === 'Out For Delivery' && (
                    <View style={styles.actionCard}>
                        <Text style={styles.actionTitle}>Order Delivery</Text>
                        <Text style={styles.actionDescription}>Once you receive your order, confirm thedelivery to complete the order.</Text>
                        <TouchableOpacity
                            style={styles.receivedButton}
                            activeOpacity={0.8}
                            onPress={handleOrderReceived}
                        >
                            <Text style={styles.receivedButtonText}>Order Received</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(order.status === 'Order Placed' ||
                    order.status === 'Processing') && (
                        <View style={styles.actionCard}>
                            <Text style={styles.actionTitle}>Order Actions</Text>
                            <Text style={styles.actionDescription}>You can cancel this order while it isbeing placed or processed.</Text>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                activeOpacity={0.8}
                                onPress={handleCancelOrder}
                            >
                                <Text style={styles.cancelButtonText}>Cancel Order</Text>
                            </TouchableOpacity>
                        </View>
                    )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F7FB',
    },

    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#858A98',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 18,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEF2',
    },

    headerBackButton: {
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

    deleteHeaderButton: {
        height: 40,
        paddingHorizontal: 13,
        borderRadius: 10,
        backgroundColor: '#FFF1F1',
        borderWidth: 1,
        borderColor: '#FF5A5A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    deleteHeaderText: {
        color: '#E53935',
        fontSize: 13,
        fontWeight: '800',
    },

    headerRightSpace: {
        width: 64,
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    orderStatusCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#20222A',
        marginBottom: 18,
    },

    statusContainer: {
        marginTop: 2,
    },

    statusItem: {
        flexDirection: 'row',
        minHeight: 66,
    },

    statusLeft: {
        width: 38,
        alignItems: 'center',
    },

    statusCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ECEEF3',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },

    statusCircleActive: {
        backgroundColor: '#4263EB',
    },

    statusCircleText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#858A98',
    },

    statusCircleTextActive: {
        color: '#FFFFFF',
    },

    statusLine: {
        position: 'absolute',
        top: 32,
        width: 2,
        height: 48,
        backgroundColor: '#E3E5EB',
    },

    statusLineActive: {
        backgroundColor: '#4263EB',
    },

    statusContent: {
        flex: 1,
        marginLeft: 12,
        paddingTop: 6,
    },

    statusTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#858A98',
    },

    statusTitleActive: {
        color: '#20222A',
    },

    currentStatusText: {
        fontSize: 12,
        color: '#4263EB',
        marginTop: 3,
        fontWeight: '600',
    },

    productCard: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    productContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    imageContainer: {
        width: 95,
        height: 100,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#F2F3F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    productImage: {
        width: '100%',
        height: '100%',
    },

    imagePlaceholder: {
        fontSize: 35,
    },

    productInfo: {
        flex: 1,
        marginLeft: 15,
    },

    productName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#20222A',
    },

    productPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#4263EB',
        marginTop: 8,
    },

    summaryCard: {
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 13,
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

    divider: {
        height: 1,
        backgroundColor: '#ECEEF2',
        marginVertical: 5,
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#20222A',
    },

    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#4263EB',
    },

    invoiceButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: '#4263EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    invoiceButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    actionCard: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    actionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#20222A',
        marginBottom: 8,
    },

    actionDescription: {
        fontSize: 13,
        lineHeight: 20,
        color: '#858A98',
        marginBottom: 16,
    },

    receivedButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: '#4263EB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    receivedButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    cancelButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: '#FFF1F1',
        borderWidth: 1,
        borderColor: '#FF5A5A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelButtonText: {
        color: '#E53935',
        fontSize: 15,
        fontWeight: '800',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F7FB',
        paddingHorizontal: 30,
    },

    emptyIcon: {
        fontSize: 50,
        marginBottom: 15,
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

export default OrderDetailsScreen;