import { json } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseConfig } from '$lib/firebaseConfig';

export async function POST({ request }) {
  try {
    const { dataToSend } = await request.json();
    const sid = dataToSend.sessionID;
    const productoID = dataToSend.productoID;
    console.log("productoID=", productoID);
    console.log("sessionID=", sid);
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    // check if there exists cart document for the sessionID in the carts collection, 
    const cartRef = doc(db, "carts", sid);
    const cartSnap = await getDoc (cartRef);
    if (cartSnap.exists()) {
        //check if product exists in cart productsList array, 
        //if so then decrement quantity by 1
        //if quantity == 0 remove item from array
        var cartData = cartSnap.data();
        for (let i = 0; i < (cartData.productsList).length; i++) {
          if (cartData.productsList[i].id === parseInt(productoID)) {
            cartData.productsList[i].quantity -= 1;
            if (cartData.productsList[i].quantity == 0) {
              cartData.productsList.splice(i, 1);
            }
            break;
          }
        }
        // update database
        await setDoc(doc(db, "carts", sid), cartData);
    }

    return json({ message: 'producto quitado correctamente.' }, { status: 201 });

  } catch (error) {
    // Handle errors
    console.error('Error Inesperado:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'error al quitar producto del carro' }, { status: 500 });
  }
}
