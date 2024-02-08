// Import necessary modules and functions
import { error } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, type DocumentData, Firestore } from "firebase/firestore";
import { randomBytes } from 'crypto';
import { firebaseConfig } from '$lib/firebaseConfig.js';

// Function to load data
export async function load({ cookies }) {
    // Initialize variables
    let cart;
    let cartExists = false;

    // Initialize Firebase app and Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Retrieve session ID from cookies or generate a new one
    const sessionIdCookie = cookies.get('sessionId');
    console.log("sessionId cookie:", sessionIdCookie);
    let sessionId = sessionIdCookie || generateSessionId(cookies);

    // Check if a cart exists for the session
    if (!sessionIdCookie) {
        cart = { productsList: [] }; // Initialize an empty cart if no session ID found
    } else {
        console.log("using existing cookie");
        try {
            cart = await fetchCartFromFirestore(db, sessionId); // Attempt to fetch cart from Firestore
            cartExists = true; // Set cartExists flag to true if cart is found
        } catch (err) {
            // Handle errors fetching cart from Firestore
            console.log("Error fetching cart from Firestore:", err);
            console.log("Invalidating sessionId cookie and regenerating session ID...");
            cookies.set('sessionId', '', { path: '/', expires: new Date(0) }); // Invalidate cookie
            sessionId = generateSessionId(cookies); // Regenerate session ID
            cart = { productsList: [] }; // Set empty cart
        }
    }

    const timestamp = new Date().getTime(); // Get current timestamp

    try {
        const data = await fetchDataFromFirestore(db); // Fetch data from Firestore
        if (data.length === 0) {
            throw new Error("No data found in Firestore."); // Throw an error if no data found
        }
        // Return the retrieved data along with other necessary information
        return {
            timestamp,
            sessionId,
            cart,
            cartExists,
            db: data
        };
    } catch (err) {
        throw error(500, 'Connection with database reset. Error: ' + err); // Throw an error if connection reset
    }
}

// Function to fetch data from Firestore
async function fetchDataFromFirestore(db: Firestore) {
    const querySnapshot = await getDocs(collection(db, "products")); // Query the "products" collection
    const data: DocumentData[] = [];
    // Iterate through query snapshot and push data to an array
    querySnapshot.forEach(doc => {
        data.push(doc.data());
    });
    return data; // Return the fetched data
}

// Function to fetch cart data from Firestore
async function fetchCartFromFirestore(db: Firestore, sid: string) {
    console.log("querying firestore with sid=", sid, "...");
    const cartRef = doc(db, "carts", sid); // Reference to the cart document
    const cartSnap = await getDoc(cartRef); // Retrieve cart document snapshot
    if (cartSnap.exists()) {
        console.log("cart data from layout:", cartSnap.data());
        return cartSnap.data(); // Return cart data if document exists
    } else {
        console.log("document not found in db...");
        throw new Error("Cart document not found in Firestore."); // Throw an error if cart document not found
    }
}

// Function to generate a session ID and set it as a cookie
function generateSessionId(cookies: { set: (arg0: string, arg1: string, arg2: { path: string; }) => void; }) {
    let sessionId = randomBytes(8).toString('hex'); // Generate a random session ID
    cookies.set('sessionId', sessionId, { path: '/' }); // Set the session ID as a cookie
    console.log("generated sessionID cookie:", sessionId);
    return sessionId; // Return the generated session ID
}
