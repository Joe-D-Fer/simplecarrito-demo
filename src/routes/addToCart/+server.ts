import { error, json } from '@sveltejs/kit';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, type DocumentData } from "firebase/firestore";
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

    // fetch "products" collection reference
    const productsRef = collection(db, "products");
    // make query for product id
    const q = query(productsRef, where("id", "==", productoID));
    // query
    const querySnap = await getDocs (q);
    // save query result in productData array []
    const productData: DocumentData[] = [];
    querySnap.forEach((doc) => {
      productData.push(doc.data());
    });
    //console.log("product data from addtocart route:", productData);
    // check for invalid data
    if (!(productData.length === 1)) {
      throw error;
    }
    

    // check if there already is a cart document for the sessionID in the carts collection, 
    const cartRef = doc(db, "carts", sid);
    const cartSnap = await getDoc (cartRef);
    if (cartSnap.exists()) {
        //check if same product already is in cart productsList array, 
        //if so then increment quantity by 1
        var cartData = cartSnap.data();
        let found = false;
        for (let i = 0; i < (cartData.productsList).length; i++) {
          if (cartData.productsList[i].id === parseInt(productoID)) {
            cartData.productsList[i].quantity += 1;
            found = true;
            break;
          }
        }
        if (!found) {
           // If no match found, push a new object
          cartData.productsList.push({
            id: productData[0].id, 
            title: productData[0].title,
            brand: productData[0].brand,
            price: productData[0].price, 
            image: productData[0].images[0], 
            quantity: 1
          });
        }
        // update database
        await setDoc(doc(db, "carts", sid), cartData);
    } else {
      //if document is not in carts collection create it with the new product in productsList
      await setDoc(doc(db, "carts", sid), {
        productsList: [{
          id: productData[0].id, 
          title: productData[0].title,
          brand: productData[0].brand,
          price: productData[0].price, 
          image: productData[0].images[0], 
          quantity: 1
        }]
      });
    }

    return json({ message: 'producto agregado correctamente.' }, { status: 201 });

  } catch (error) {
    // Handle errors
    console.error('Error Inesperado:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'error al agregar producto al carro' }, { status: 500 });
  }
}
