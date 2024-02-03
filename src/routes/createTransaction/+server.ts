import { error, json } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, type DocumentData, Firestore } from "firebase/firestore";
import { firebaseConfig } from '$lib/firebaseConfig';

export async function POST({ request }) {
  try {
    const { dataToSend } = await request.json();
    const sid = dataToSend.SID;
    console.log("sessionID=", sid);

    
    const buyOrder = generatePurchaseOrder();

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);


    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    const cart = await fetchCartFromFirestore(db, sid);
    const amount = calculateAmount(cart);

    return json({ message: 'Transaccion realizada' }, { status: 201 });

  } catch (error) {
    // Handle errors
    console.error('Error Inesperado:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'error en createTransaction route' }, { status: 500 });
  }
}

function generatePurchaseOrder() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ|_=&%.,~:/?[+!@()>-';
  const maxLength = 26;
  let purchaseOrder = '';

  for (let i = 0; i < maxLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      purchaseOrder += characters[randomIndex];
  }

  return purchaseOrder;
}

function calculateAmount(cart: DocumentData | { quantity: number; price: number; }[]) {
  let totalPrice = 0;
  cart.forEach((product: { quantity: number; price: number; }) => {
    totalPrice += product.price * product.quantity;
  });
  return totalPrice;
}

async function fetchCartFromFirestore(db: Firestore, sid: string) {
  console.log("querying firestore with sid=", sid, "...");
  const cartRef = doc(db, "carts", sid);
  const cartSnap = await getDoc(cartRef);
  if (cartSnap.exists()) {
      console.log("cart data from layout:", cartSnap.data());
      return cartSnap.data();
  } else {
      console.log("document not found in db...");
      throw new Error("Cart document not found in Firestore.");
  }
}