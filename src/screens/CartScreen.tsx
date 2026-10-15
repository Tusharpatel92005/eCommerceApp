import React, { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { placeOrder } from '../services/firebase';
import { CartScreenNavigationProp, CartScreenRouteProp } from '../types/navigationTypes';
import { Product } from '../types/type';
import { SafeAreaView } from 'react-native-safe-area-context';


const CartScreen = ({ route, navigation }: { route: CartScreenRouteProp, navigation: CartScreenNavigationProp }) => {
    const product: Product = route.params.product;
    const [quantity, setQuantity] = useState(1);
    const [placingOrder, setPlacingOrder] = useState(false);

    if (!product) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Cart is Empty</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const imageUri = product.images[0] || '';
    const price = product.price;
    const totalPrice = price * quantity;

    const increaseQuantity = () => {
        const availableStock = product.stock;

        setQuantity(prev => {
            if (prev >= availableStock) {
                Alert.alert('Stock Limit', `Only ${availableStock} items are available.`);
                return prev;
            }

            return prev + 1;
        });
    };

    const decreaseQuantity = () => {
        setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    };

    const handleBuyProduct = async () => {
        if (placingOrder) {
            return;
        }

        if (quantity > product.stock) {
            Alert.alert('Stock Limit', `Only ${product.stock} items are available.`);
            return;
        }

        if (product.stock <= 0) {
            Alert.alert('Out of Stock', 'This product is currently out of stock.');
            return;
        }

        try {
            setPlacingOrder(true);
            const orderId = await placeOrder({
                productId: product?.id,
                name: product?.name,
                imageUrl: imageUri || '',
                price,
                quantity,
                totalPrice,
            });

            Alert.alert('Order Placed', 'Your order placed successfully.',
                [
                    { text: 'Continue', onPress: () => navigation.navigate('ProductList') },
                    {
                        text: 'Show Invoice',
                        onPress: () =>
                            navigation.navigate('Invoice', {
                                orderId,
                                product: {
                                    ...product,
                                    images: [imageUri],
                                },
                                price,
                                quantity,
                                totalPrice,
                            }),
                    },
                ],
                { cancelable: false },
            );
        } catch (error) {
            Alert.alert('Error', 'Unable to place your order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButtonHeader}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Cart</Text>
                    <Text style={styles.headerSubtitle}>Review your product</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.productCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product?.name}</Text>
                        <Text style={styles.productPrice}>₹{price}</Text>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                activeOpacity={0.7}
                                onPress={decreaseQuantity}>
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                activeOpacity={0.7}
                                onPress={increaseQuantity}>
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
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
                        <Text style={styles.totalLabel}>Total Price</Text>
                        <Text style={styles.totalValue}>₹{totalPrice}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.buyButton, placingOrder && styles.buyButtonDisabled]}
                    activeOpacity={0.8}
                    disabled={placingOrder}
                    onPress={handleBuyProduct}>
                    {placingOrder ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.buyButtonText}>Buy Product</Text>
                            <Text style={styles.buyButtonArrow}>→</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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

    content: {
        flex: 1,
        padding: 20,
    },

    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    imageContainer: {
        width: 105,
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F2F3F6',
    },

    productImage: {
        width: '100%',
        height: '100%',
    },

    productInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
        paddingVertical: 3,
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
        marginTop: 5,
    },

    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: '#F1F3F8',
        padding: 4,
    },

    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    quantityButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4263EB',
        lineHeight: 22,
    },

    quantityText: {
        width: 36,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '800',
        color: '#20222A',
    },

    summaryCard: {
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

    summaryTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#20222A',
        marginBottom: 16,
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

    buyButton: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#4263EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    buyButtonDisabled: {
        opacity: 0.7,
    },

    buyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

    buyButtonArrow: {
        color: '#FFFFFF',
        fontSize: 22,
        marginLeft: 10,
        marginTop: -2,
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

export default CartScreen;
