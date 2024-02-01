import { error } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { firebaseConfig } from '$lib/firebaseConfig';

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
        const data = await fetchDataFromFirestore(db, productId);
        if (data.length === 0) {
            throw error(420, 'Enhance your calm');
        }
        return {
            timestamp: timestamp,
            item: data
        };
    } catch (err) {
        throw error(420, 'Enhance your calm');
    }
}

/**
 * @param {import("@firebase/firestore").Firestore} db
 * @param {number} productId
 */
async function fetchDataFromFirestore(db, productId) {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("id", "==", productId));
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
