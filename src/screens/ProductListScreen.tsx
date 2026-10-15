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

import { deleteAccount, getProducts, logoutUser } from '../services/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { Product } from '../types/type';
import { ProductListScreenNavigationProp } from '../types/navigationTypes';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductListScreen = ({ navigation }: { navigation: ProductListScreenNavigationProp }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const loadProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  )

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logoutUser();
            } catch (error) {
              Alert.alert('Logout Failed', 'Unable to logout. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  const handleOrders = () => {
    setDrawerVisible(false);
    navigation.navigate('Orders');
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account.',
      [{ text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.prompt('Confirm Password', 'Enter your password to permanently delete your account.',
            async (password) => {
              try {
                setDeletingAccount(true);
                await deleteAccount(password);
                Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              } catch (error: any) {
                console.log('Account deletion failed:', error);
                Alert.alert('Delete Failed', 'Unable to delete your account. Please try again.');
              } finally {
                setDeletingAccount(false);
              }
            },
            'secure-text'
          );
        },
      },
      ]
    );
  };

  const getStockStatus = (stock: number) => {
    return {
      text: `${stock} in stock`,
      background: '#EDF8F1',
      textColor: '#368456',
    };
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stock);
    const imageUri = item.images[0];

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetails', { product: item })
        }>

        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri || '' }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>📦</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{item.name}</Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.background }]}>
              <Text style={[styles.stockText, { color: stockStatus.textColor }]}>{stockStatus.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowButton}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </TouchableOpacity>
    );

  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#4263EB" style={styles.loader} />
          <Text style={styles.loadingTitle}>Loading Products</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.headerTitle}>Product List</Text>
                <Text style={styles.headerSubtitle}>Explore our products</Text>
              </View>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setDrawerVisible(true)}
                activeOpacity={0.8}>
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadProducts(true)}
                tintColor="#4263EB"
                colors={['#4263EB']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>📦</Text>
                </View>
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptyDescription}>There are currently no products available.</Text>
              </View>
            }
          />

          {drawerVisible && (
            <>
              <TouchableOpacity
                style={styles.menuBackdrop}
                activeOpacity={1}
                onPress={() => setDrawerVisible(false)}
              />

              <View style={styles.accountMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleOrders}
                  activeOpacity={0.7}>
                  <Text style={styles.menuItemText}>Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setDrawerVisible(false);
                    handleLogout();
                  }}
                  disabled={loggingOut || deletingAccount}
                  activeOpacity={0.7}>
                  <Text style={styles.menuItemText}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setDrawerVisible(false);
                    handleDeleteAccount();
                  }}
                  disabled={deletingAccount || loggingOut}
                  activeOpacity={0.7}>
                  <Text style={[styles.menuItemText, styles.deleteMenuText]}>{deletingAccount ? 'Deleting...' : 'Delete Account'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#181A20',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#858A98',
    marginTop: 3,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  productCard: {
    minHeight: 130,
    marginBottom: 14,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  imageContainer: {
    width: 98,
    height: 106,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F7',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIcon: {
    fontSize: 35,
  },

  productInfo: {
    flex: 1,
    marginLeft: 14,
    paddingVertical: 3,
    minWidth: 0,
  },

  nameRow: {
    paddingRight: 4,
  },

  productName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#20222A',
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#F0F2FF',
  },

  categoryText: {
    fontSize: 10,
    color: '#4263EB',
    fontWeight: '800',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingRight: 3,
  },

  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4263EB',
  },

  stockBadge: {
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  stockText: {
    fontSize: 9,
    fontWeight: '800',
  },

  arrowButton: {
    width: 32,
    height: 32,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    fontSize: 25,
    lineHeight: 28,
    color: '#626774',
    marginTop: -2,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E9EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20222A',
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 13,
    color: '#858A98',
    textAlign: 'center',
    lineHeight: 19,
  },

  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F6F7FB',
  },

  loader: {
    marginBottom: 16,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20222A',
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuIcon: {
    fontSize: 27,
    lineHeight: 30,
    color: '#4263EB',
    fontWeight: '800',
    marginTop: -4,
  },

  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },

  accountMenu: {
    position: 'absolute',
    top: 82,
    right: 18,
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 6,
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  menuItem: {
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20222A',
    marginLeft: 6,
  },

  deleteMenuText: {
    color: '#D64545',
  },
});

export default ProductListScreen;