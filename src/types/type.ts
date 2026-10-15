import { Timestamp } from "@react-native-firebase/firestore";

export type OrderStatus =
    | 'Order Placed'
    | 'Processing'
    | 'Dispatch'
    | 'Out For Delivery'
    | 'Order Completed'
    | 'Cancelled';

export type Product = {
    id: string;
    name: string;
    description?: string;
    category?: string;
    brand?: string;
    price: number;
    stock: number;
    images: string[];
};

export type Order = {
    id: string;
    productId?: string;
    name: string;
    images: string[];
    price: number;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    orderedAt?: Timestamp;
};

export type OrderData = {
    productId: string;
    name: string;
    imageUrl: string | null;
    price: number;
    quantity: number;
    totalPrice: number;
  }

export type InvoiceProduct = {
    name: string;
    images: string[];
};