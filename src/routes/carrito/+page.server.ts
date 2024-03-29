import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, Firestore} from "firebase/firestore";
import { randomBytes } from 'crypto';
import { firebaseConfig } from '$lib/firebaseConfig.js';

export async function load({ cookies }) {
  let cart;
  let cartExists = false;

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const sessionIdCookie = cookies.get('sessionId');
  console.log("sessionId cookie:", sessionIdCookie);
  let sessionId = sessionIdCookie || generateSessionId(cookies);

  if (!sessionIdCookie) {
      cart = { productsList: [] };
  } else {
      console.log("using existing cookie");
      try {
          cart = await fetchCartFromFirestore(db, sessionId);
          cartExists = true;
      } catch (err) {
          console.log("Error fetching cart from Firestore:", err);
          console.log("Invalidating sessionId cookie and regenerating session ID...");
          cookies.set('sessionId', '', { path: '/', expires: new Date(0) }); // Invalidate cookie
          sessionId = generateSessionId(cookies); // Regenerate session ID
          cart = { productsList: [] }; // Set empty cart
      }
  }

    const timestamp = new Date().getTime(); // Get current timestamp also reloads images

    return {
        timestamp,
        sessionId,
        cart,
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