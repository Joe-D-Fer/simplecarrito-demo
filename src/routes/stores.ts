import { writable } from 'svelte/store';

const myStore = {
  isCartOpen: false,
  productIndex: 0,
  cartItemCountTotal: 0
};

export const carrito = writable(myStore);