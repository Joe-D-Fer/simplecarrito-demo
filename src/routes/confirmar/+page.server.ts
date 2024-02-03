import { redirect } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, type DocumentData, Firestore} from "firebase/firestore";
import { randomBytes } from 'crypto';
import { firebaseConfig } from '$lib/firebaseConfig.js';
import { WebpayPlus } from "transbank-sdk";
import { transbankOptions } from "$lib/server/transbankoptions.server.js";


export async function load({ cookies }) {
    let cart;
    let cartExists = false;

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const sessionIdCookie = cookies.get('sessionId');
    console.log("sessionId cookie:", sessionIdCookie);
    const sessionId = sessionIdCookie || generateSessionId(cookies);

    if (!sessionIdCookie) {
        cart = { productsList: [] };
        redirect(308, "/carrito");
    } else {
        console.log("using existing cookie");
        try {
            cart = await fetchCartFromFirestore(db, sessionId);
            cartExists = true;
            if (cart.productsList.length == 0) {
              redirect(308, "/carrito");
            }
        } catch (err) {
            console.log("Error fetching cart from Firestore:", err);
            console.log("Invalidating sessionId cookie and regenerating session ID...");
            cookies.set('sessionId', '', { path: '/', expires: new Date(0) }); // Invalidate cookie
            redirect(308, "/carrito");
        }
    }

    const buyOrder = generatePurchaseOrder();
    const amount = calculateAmount(cart);
    const returnUrl = "https://simplecarrito-demo.vercel.app/return";
    const createResponse = await (new WebpayPlus.Transaction(transbankOptions)).create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );
    const token = createResponse.token;
    const url = createResponse.url;
    
    let viewData = {
      buyOrder,
      sessionId,
      amount,
      returnUrl,
      token,
      url,
    };

    const timestamp = new Date().getTime(); // Get current timestamp also reloads images

    return {
        viewData,
        timestamp,
        verifiedSid: sessionId,
        verifiedCart: cart,
        cartExists
    };
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

function generateSessionId(cookies: { set: (arg0: string, arg1: string, arg2: { path: string; }) => void; }) {
    let sessionId = randomBytes(8).toString('hex');
    cookies.set('sessionId', sessionId, { path: '/' });
    console.log("generated sessionID cookie:", sessionId);
    return sessionId;
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