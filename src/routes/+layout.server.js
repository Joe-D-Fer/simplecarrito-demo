import { error } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc} from "firebase/firestore";
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
        cart = await fetchCartFromFirestore(db, sessionId);
        cartExists = true;
    }

    const timestamp = new Date().getTime(); // Get current timestamp also reloads images

    try {
        const data = await fetchDataFromFirestore(db);
        if (data.length === 0) {
            throw new Error("No data found in Firestore.");
        }
        return {
            timestamp,
            sessionId,
            cart,
            cartExists,
            db: data
        };
    } catch (err) {
        throw error(500, 'Connection with database reset. Error: ' + err);
    }
}

/**
 * @param {import("@firebase/firestore").Firestore} db
 */
async function fetchDataFromFirestore(db) {
    const querySnapshot = await getDocs(collection(db, "products"));
    /**
     * @type {import("@firebase/firestore").DocumentData[]}
     */
    const data = [];
    querySnapshot.forEach(doc => {
        data.push(doc.data());
    });
    return data;
}

/**
 * @param {import("@firebase/firestore").Firestore} db
 * @param {string} sid
 */
async function fetchCartFromFirestore(db, sid) {
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

/**
 * @param {{ set: (arg0: string, arg1: string, arg2: { path: string; }) => void; }} cookies
 */
function generateSessionId(cookies) {
    let sessionId = randomBytes(8).toString('hex');
    cookies.set('sessionId', sessionId, { path: '/' });
    console.log("generated sessionID cookie:", sessionId);
    return sessionId;
}
