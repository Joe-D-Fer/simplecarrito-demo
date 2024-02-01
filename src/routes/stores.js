import { writable } from 'svelte/store';

const myArrayStore = {
  isCartOpen: false,
  productIndex: 0
};

export const carrito = writable(myArrayStore);