import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getOrders } from '../services/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { Order } from '../types/type';
import { OrdersScreenNavigationProp } from '../types/navigationTypes';
import { SafeAreaView } from 'react-native-safe-area-context';


const OrdersScreen = ({ navigation }: { navigation: OrdersScreenNavigationProp }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load your orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const imageUrl = item.images[0]

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.orderContent}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.totalPrice}>₹{item.totalPrice}</Text>
          <View style={styles.bottomRow}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text style={styles.viewText}>View Details</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSubtitle}>All orders information</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Orders</Text>
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#666',
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

  backButton: {
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

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  imageContainer: {
    width: 120,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#F6F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },

  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  orderContent: {
    flex: 1,
    marginLeft: 14,
  },

  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 5,
  },

  quantity: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
  },

  totalPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4263EB',
    marginBottom: 8,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusContainer: {
    backgroundColor: '#E8EDFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4263EB',
    textTransform: 'capitalize',
  },

  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4263EB',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 25,
  },

  shopButton: {
    backgroundColor: '#4263EB',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 10,
  },

  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default OrdersScreen;
