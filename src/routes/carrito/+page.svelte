<script lang="ts">
  import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
  import { carrito } from '../stores.js';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

  export let data;
  $: reactiveProductsList = data.cart.productsList;
  const toastStore = getToastStore();
	const t: ToastSettings = {
		message: 'Error Agregando Producto al Carro...',
	};
  const t2: ToastSettings = {
    message: 'Producto Eliminado del Carro.'
  };
  const t3: ToastSettings = {
    message: 'Error intentando quitar Producto del carro...'
  };
  let inputValue = '1';
	let lastsafeinputValue = '1';

  function handleInput() {
		let value = inputValue.trim(); // Trim any leading or trailing spaces

    // Check if the input is empty
    if (value === '') {
      inputValue = '0';
      lastsafeinputValue = '0';
      return;
    }

		    // Clean leading zeroes
				value = value.replace(/^0+/, '');


    // Check if the input is a valid number between 0 and 999
    if (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 999) {
      inputValue = value;
      lastsafeinputValue = value;
    } else {
      // If not valid, revert to the last safe input value
      inputValue = lastsafeinputValue;
    }
	}

  async function addToCart(productoID:number, sessionID:string, i:number) {
		console.log("producto a agregar:", productoID);
		const dataToSend = { productoID, sessionID };
		const response = await fetch('/addToCart', {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dataToSend }),
		});
		if (response.ok) {
				console.log("producto agregado.");
				$carrito.cartItemCountTotal += 1;
        data.cart.productsList[i].quantity +=1;
		} else {
				console.log("error al agregar producto.");
				toastStore.trigger(t);
		}
	}
  async function removeFromCart(productoID:number, sessionID:string, i:number) {
		console.log("producto a quitar:", productoID);
		const dataToSend = { productoID, sessionID };
		const response = await fetch('/removeFromCart', {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dataToSend }),
		});
		if (response.ok) {
				console.log("producto quitado.");
        if ($carrito.cartItemCountTotal > 0) {
          $carrito.cartItemCountTotal -= 1;
        }
				if (data.cart.productsList[i].quantity == 1) {
          data.cart.productsList.splice(i, 1);
          data = data;
          toastStore.trigger(t2);
          console.log("readctserverdata:", data);
        }else{
          data.cart.productsList[i].quantity -= 1;
        }
		} else {
				console.log("error al quitar producto.");
				toastStore.trigger(t3);
		}
	}

  onMount(()=> {
    let itemCountTotal = 0;
    console.log("data on mount:", data);
    if (!(data.cart.productsList.length == 0)) {
      data.cart.productsList.forEach((element: { quantity: number; }) => {
        itemCountTotal += element.quantity;
      });
    }
    if (!(itemCountTotal == $carrito.cartItemCountTotal)) {
      invalidate((url) => url.pathname === '/carrito')
    }
  })
</script>
<div class="grid grid-cols-12 gap-4 w-full">
  <div class="col-span-9">
  {#if (reactiveProductsList).length > 0}
    <div class="flex items-center mt-4 pt-4 ml-1 pl-1 md:ml-4 md:pl-4">
      <p class="h3 mr-4">Carrito</p>
      <p>
      {#if ($carrito.cartItemCountTotal == 1)}
        <span class="text-gray-400 h5">&#40;1 Producto&#41;</span>
      {:else}
        <span class="text-gray-400 h5">&#40;{$carrito.cartItemCountTotal} Productos&#41;</span>
      {/if}
      </p>
    </div>
  {/if}
    <div class="flex justify-center p-1 m-1 md:p-4 md:m-4">
      <div class="bg-white rounded-lg">
        {#if (reactiveProductsList).length == 0}
          <div class="flex m-4 p-4 rounded-lg text-gray-800">
            
            <p class="h2">Tu Carrito está vacío</p>
          </div>
        {:else}
          <div class="grid grid-cols-12 gap-4 w-full">
            {#each reactiveProductsList as producto, i}
              <div class="py-4 px-0 col-span-12 lg:col-span-5 flex">
                  <div class="flex-shrink-0 overflow-hidden bg-gray-200 rounded-lg w-24 h-24 m-4">
                      <img class="object-cover w-full h-full" src="{producto.image}" alt="producto agregado al carro" />
                  </div>
                  <div class="m-4 flex-grow flex flex-col justify-center">
                      <p class="text-gray-900 capitalize overflow-hidden whitespace-nowrap max-w-xs">
                          <span class="inline-block whitespace-normal">{producto.title}</span>
                      </p>
                      <p class="text-gray-600 uppercase">{producto.brand}</p>
                  </div>
              </div>

              <div class="p-4 px-0 col-span-3 lg:col-span-4">
                <div class="text-gray-900 m-4">${(producto.price).toLocaleString()}</div>
              </div>

              <div class="p-4 px-0 col-span-9 lg:col-span-3 flex justify-end">
                <div class="btn-group m-4" style="height: 3rem;">
                  <button class="addtocart-btn bg-gray-600" on:click|preventDefault={() => removeFromCart(producto.id, data.sessionId, i)}>-</button>
                  <input class="text-gray-800" type="text" style="width: 4rem;" value="{producto.quantity}" disabled/>
                  <button class="addtocart-btn bg-gray-600" on:click|preventDefault={() => addToCart(producto.id, data.sessionId, i)}>+</button>
                </div> 
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
  <div class="col-span-3">
    <p class="h3 mr-4">Resumen de la Compra</p>
    <div class="flex justify-center p-1 m-1 md:p-4 md:m-4">
      <div class="bg-white rounded-lg">
        <p class="h5 text-gray-800">productos</p>
        <p class="h5 text-gray-800">Total</p>
        <a class="btn btn-variant-filled bg-primary" href="">Continuar Compra</a>
      </div>
    </div>
  </div>
</div>
{#if (reactiveProductsList).length == 0}
<div class="flex justify-center">
  <img src="/empty-logo.webp" alt="empty cart logo">
</div>  
{/if}
<style>
  .addtocart-btn:hover,
  .addtocart-btn:focus {
    background-color: gray;
    color: #272727;
  }
</style>