import React from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductDetailsRouteProp, ProductDetailsNavigationProp } from '../types/navigationTypes';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductDetailsScreen = ({ route, navigation }: { route: ProductDetailsRouteProp; navigation: ProductDetailsNavigationProp;}) => {  
  const product = route.params.product;

  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
        </View>

        <Text style={styles.emptyTitle}>Product Not Found</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUri = product.images[0];

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
          <Text style={styles.headerTitle}>Product Details</Text>
          <Text style={styles.headerSubtitle}>Complete product information</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.mainImageCard}>
          <Image
            source={{ uri: imageUri || ''}}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.price}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{product.category}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Brand</Text>
                <Text style={styles.infoValue}>{product.brand}</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>₹{product.price}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Stock</Text>
                <Text style={styles.infoValue}>{product.stock} units</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToCartButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Cart', { product })}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
          <Text style={styles.addToCartArrow}>→</Text>
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

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  mainImageCard: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  mainImage: {
    width: '100%',
    height: '100%',
  },

  titleSection: {
    marginTop: 20,
  },

  productName: {
    fontSize: 25,
    fontWeight: '800',
    color: '#181A20',
  },

  productPrice: {
    fontSize: 23,
    fontWeight: '800',
    color: '#4263EB',
    marginTop: 7,
  },

  section: {
    marginTop: 26,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#20222A',
    marginBottom: 11,
  },

  infoCard: {
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

  infoRow: {
    flexDirection: 'row',
    gap: 15,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#8B909D',
    fontWeight: '600',
    marginBottom: 6,
  },

  infoValue: {
    fontSize: 15,
    color: '#20222A',
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#ECEEF2',
    marginVertical: 17,
  },

  descriptionCard: {
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

  description: {
    fontSize: 14,
    lineHeight: 23,
    color: '#626774',
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 55,
  },

  addToCartButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4263EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4263EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  addToCartArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F6F7FB',
  },

  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: '#E9EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#20222A',
  },

  emptyButton: {
    height: 50,
    paddingHorizontal: 25,
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: '#4263EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default ProductDetailsScreen;
