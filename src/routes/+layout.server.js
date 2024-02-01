import { error } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc} from "firebase/firestore";
import { randomBytes } from 'crypto';
import { firebaseConfig } from '$lib/firebaseConfig.js';

export async function load({ cookies }) {
    /**
     * @type {import("@firebase/firestore").DocumentData}
     */
    let cart;
    let cartExists = false;
        
    // setup firebase connection
    const app = initializeApp(firebaseConfig);
    // fetch firestore db
    const db = getFirestore(app);

    const sessionIdCookie = cookies.get('sessionId');
    console.log("sessionId cookie:", sessionIdCookie);
    var sessionId = '';
    if (typeof sessionIdCookie === 'undefined') {
        console.log("generating sessionID cookie...");
        sessionId = generateSessionId();
        cookies.set('sessionId', sessionId, { path: '/' });
        cart = {productsList:[]};
    } else {
        console.log("using existing cookie");
        sessionId = sessionIdCookie;
        //get cart data
        cart = await fetchCartFromFirestore(db, sessionId);
        cartExists = true;
    };

    

    const timestamp = new Date().getTime(); // Get current timestamp also reloads images


    try {
        const data = await fetchDataFromFirestore(db);
        if (data.length === 0) {
            throw error;
        }
        return {
            timestamp: timestamp,
            sessionId: sessionId,
            cart: cart,
            cartExists : cartExists,
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
    console.log("querying firestore with sid=", sid, "...");
    const cartRef = doc(db, "carts", sid);
    const cartSnap = await getDoc (cartRef);
    let cartData;
    if (cartSnap.exists()) {
        console.log("cart data from layout:", cartSnap.data());
        cartData = cartSnap.data();
    }else{
        console.log("document not found in db...");
        cartData = {productsList:[]};
    }
    return cartData;
}


function generateSessionId() {
    // Generate a random session ID using Node.js's crypto module
    return randomBytes(8).toString('hex');
}
