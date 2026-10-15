import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  getDoc,
  runTransaction
} from '@react-native-firebase/firestore';

import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@react-native-firebase/auth';

import { Order, OrderData, Product } from '../types/type';

const db = getFirestore();
const auth = getAuth();

export const signupUser = async (email: string, password: string,) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await signOut(auth);
  return result.user;
};

export const loginUser = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;
  await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email, lastLoginAt: serverTimestamp() }, { merge: true });
  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getProducts = async (): Promise<Product[]> => {
  const ProductData = await getDocs(collection(db, 'products'));

  return ProductData.docs.map(document => {
    const data = document.data();

    return {
      id: document.id,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      price: Number(data.price),
      stock: Number(data.stock),
      images: data.images,
    };
  });
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const deleteAccount = async (password: string) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No authenticated user found.');
  }

  if (!currentUser.email) {
    throw new Error('User email not found.');
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);

    await reauthenticateWithCredential(currentUser, credential);
    await deleteDoc(doc(db, 'users', currentUser.uid));
    await deleteUser(currentUser);

  } catch (error: any) {
    console.log('DELETE ACCOUNT ERROR:', error);
    console.log('ERROR CODE:', error?.code);
    console.log('ERROR MESSAGE:', error?.message);
    throw error;
  }
};

export const placeOrder = async (orderData: OrderData) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in');
  }

  if (!orderData.productId) {
    throw new Error('Product ID not found');
  }

  if (orderData.quantity <= 0) {
    throw new Error('Invalid quantity');
  }

  const productRef = doc(db, 'products', orderData.productId,);
  const ordersCollection = collection(db, 'users', user.uid, 'order details');
  const orderRef = doc(ordersCollection);

  await runTransaction(db, async transaction => {
    const productDocument = await transaction.get(productRef);

    if (!productDocument.exists()) {
      throw new Error('Product not found.');
    }

    const productData = productDocument.data();
    const currentStock = Number(productData?.stock ?? 0);

    if (currentStock <= 0) {
      throw new Error('This product is out of stock.');
    }

    if (orderData.quantity > currentStock) {
      throw new Error(`Only ${currentStock} items are available.`);
    }

    const newStock = currentStock - orderData.quantity;

    transaction.update(productRef, { stock: newStock, updatedAt: serverTimestamp() });
    transaction.set(orderRef, {
      productId: orderData.productId,
      name: orderData.name,
      images: [orderData.imageUrl],
      price: orderData.price,
      quantity: orderData.quantity,
      totalPrice: orderData.totalPrice,
      status: 'Order Placed',
      orderedAt: serverTimestamp(),
    });
  });

  return orderRef.id;
};

export const getOrders = async (): Promise<Order[]> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in');
  }

  const ordersCollection = collection(db, 'users', user.uid, 'order details');
  const OrderData = await getDocs(ordersCollection);

  const orders: Order[] = OrderData.docs.map(document => {
    const data = document.data();

    return {
      id: document.id,
      productId: data.productId,
      name: data.name,
      images: data.images,
      price: Number(data.price),
      quantity: Number(data.quantity),
      totalPrice: Number(data.totalPrice),
      status: data.status,
      orderedAt: data.orderedAt,
    };
  });

  orders.sort((a, b) => {
    const dateA = a.orderedAt?.toDate ? a.orderedAt.toDate().getTime() : 0;
    const dateB = b.orderedAt?.toDate ? b.orderedAt.toDate().getTime() : 0;
    return dateB - dateA;
  });

  return orders;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in');
  }

  if (!orderId) {
    throw new Error('Order ID not found');
  }

  const orderRef = doc(db, 'users', user.uid, 'order details', orderId);
  await setDoc(orderRef, { status }, { merge: true });
};

export const cancelOrder = async (orderId: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in');
  }

  if (!orderId) {
    throw new Error('Order ID not found');
  }

  const orderRef = doc(db, 'users', user.uid, 'order details', orderId);
  await runTransaction(db, async transaction => {
    const orderDocument = await transaction.get(orderRef);

    if (!orderDocument.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderDocument.data();

    if (orderData.status !== 'Order Placed' && orderData.status !== 'Processing') {
      throw new Error('This order can no longer be cancelled.');
    }

    const productId = orderData.productId;
    const quantity = Number(orderData.quantity ?? 0);

    if (!productId) {
      throw new Error('Product information is missing from this order.');
    }

    if (quantity <= 0) {
      throw new Error('Invalid product quantity in this order.');
    }

    const productRef = doc(db, 'products', productId);
    const productDocument = await transaction.get(productRef);

    if (!productDocument.exists()) {
      throw new Error('Product not found.');
    }

    const productData = productDocument.data();
    const currentStock = Number(productData?.stock ?? 0);
    const newStock = currentStock + quantity;

    transaction.update(productRef, { stock: newStock, updatedAt: serverTimestamp() });
    transaction.update(orderRef, { status: 'Cancelled', cancelledAt: serverTimestamp() });
  });
};

export const deleteOrder = async (orderId: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not logged in');
  }

  if (!orderId) {
    throw new Error('Order ID not found');
  }

  const orderRef = doc(db, 'users', user.uid, 'order details', orderId);
  const orderDocument = await getDoc(orderRef);

  if (!orderDocument.exists()) {
    throw new Error('Order not found');
  }

  const orderData = orderDocument.data();

  if (orderData.status !== 'Cancelled') {
    throw new Error('Only cancelled orders can be deleted.',);
  }

  await deleteDoc(orderRef);
};

export const productsCollection = collection(db, 'products');