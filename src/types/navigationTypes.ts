import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import type { InvoiceProduct, Product } from './type';

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProductList: undefined;
    ProductDetails: { product: Product };
    Cart: { product: Product };
    Orders: undefined;
    OrderDetails: { orderId: string };
    Invoice: {
        orderId: string;
        product: InvoiceProduct;
        price: number;
        quantity: number;
        totalPrice: number;
    };
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;
export type CartScreenRouteProp = RouteProp<RootStackParamList, 'Cart'>;

export type InvoiceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Invoice'>;
export type InvoiceScreenRouteProp = RouteProp<RootStackParamList, 'Invoice'>;

export type OrderDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetails'>;
export type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

export type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Orders'>;

export type ProductDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetails'>;
export type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export type ProductListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

