import { error, redirect, fail } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, doc, getDoc} from "firebase/firestore";
import { randomBytes } from 'crypto';
import { firebaseConfig } from '$lib/firebaseConfig.js';




/**
 * @type {import("@firebase/firestore").DocumentData}
 */
let cart;

export async function load({ cookies }) {
    
    // setup firebase connection
    const app = initializeApp(firebaseConfig);
    // fetch firestore db
    const db = getFirestore(app);

    const sessionIdCookie = cookies.get('sessionId');
    console.log("sessionId cookie:", sessionIdCookie);
    var sessionId = '';
    if (typeof sessionIdCookie === 'undefined') {
        sessionId = generateSessionId();
        cookies.set('sessionId', sessionId, { path: '/' });
    } else {
        sessionId = sessionIdCookie;
    }

    //get cart data
    const cartRef = doc(db, "carts", sessionId);
    const cartSnap = await getDoc (cartRef);
    if (cartSnap.exists()) {
        console.log("cart data from layout:", cartSnap.data());
        cart = cartSnap.data();
    }

    const timestamp = new Date().getTime(); // Get current timestamp also reloads images


    try {
        const data = await fetchDataFromFirestore(db);
        if (data.length === 0) {
            throw redirect(300, '/');
        }
        return {
            timestamp: timestamp,
            sessionId,
            cart,
            db: data
        };
    } catch (err) {
        throw error(500, 'Conección con base de datos reiniciada');
    }
}

/**
 * @param {import("@firebase/firestore").Firestore} db
 */
async function fetchDataFromFirestore(db) {
    
    const querySnapshot = await getDocs(collection(db, "products"));

    /**
   * @type {any[]}
   */
    const data = [];
    querySnapshot.forEach((/** @type {{ data: () => any; }} */ doc) => {
        data.push(doc.data());
    });
    return data;
}



/**
 * @param {import("@firebase/firestore").Firestore} db
 * @param {string} sid
 */
async function fetchCartFromFirestore(db, sid) {
    
    const cartsRef = collection(db, 'carts');
    const q = query(cartsRef, where ('sessionId', '==', sid ));
    const querySnapshot = await getDocs(q);

    /**
   * @type {any[]}
   */
    const data = [];
    querySnapshot.forEach((/** @type {{ data: () => any; }} */ doc) => {
        data.push(doc.data());
    });
    return data;
}


function generateSessionId() {
    // Generate a random session ID using Node.js's crypto module
    return randomBytes(8).toString('hex');
}
