import { error } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";


const firebaseConfig = {

  apiKey: "AIzaSyDjCk6sofkUkp0yml7DTKzVVrHnI3kb0dI",

  authDomain: "simplecarrito.firebaseapp.com",

  projectId: "simplecarrito",

  storageBucket: "simplecarrito.appspot.com",

  messagingSenderId: "956327649752",

  appId: "1:956327649752:web:98c43aac3b70c0997a12ad",

  measurementId: "G-VNFLX7S6ZP"

};


/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    // Parse params.productID as a number
    const productId = parseInt(params.productID);

    // Check if productId is a valid number
    if (!productId || isNaN(productId)) {
        throw new Error('Invalid productId');
    }

    // setup firebase connection
    const app = initializeApp(firebaseConfig);
    // fetch firestore db
    const db = getFirestore(app);

    const timestamp = new Date().getTime(); // Get current timestamp also reloads images

    try {
        const data = await fetchDataFromFirestore(db);
        console.log("data:", data);
        if (data.length === 0) {
            throw error(420, 'Enhance your calm');
        }
        return {
            timestamp: timestamp,
            data: data // Assuming you want to return the fetched data as well
        };
    } catch (err) {
        throw error(420, 'Enhance your calm');
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
