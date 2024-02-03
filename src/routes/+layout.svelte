<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { carrito } from './stores.js';
	//toast ui
	import { Toast } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	
	//toast stores
	initializeStores();

	export let data;
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	
	let inputValue = '1';
	let lastsafeinputValue = '1';

	let carritoStore: { isCartOpen: any; cartItemCountTotal: any; productIndex?: number; };
	carrito.subscribe((value) =>{
		carritoStore = value;
	});

	function togglePopupCarro() {
		$carrito.isCartOpen = !carritoStore.isCartOpen;
	};
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
	};
	async function addToCart(productoID:number, sessionID:string) {
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
				console.log("carrito.prdocutindex store: ", $carrito.productIndex);
				console.log("data.cart.productsList: ", data.cart.productsList);
        inputValue = (parseInt(inputValue) + 1).toString();
		} else {
				console.log("error al agregar producto.");
		}
	}
  async function removeFromCart(productoID:number, sessionID:string) {
		if (parseInt(inputValue)>0) {
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
					inputValue = (parseInt(inputValue) - 1).toString();
			} else {
					console.log("error al quitar producto.");
			}
		}
		
	}
	onMount(() => {
		console.log('carrito store:', carritoStore);
		console.log('from layout data:', data);
		if (data.cartExists) {
			((data.cart).productsList).forEach((item: any) => {
			$carrito.cartItemCountTotal += item.quantity;
		});
		}
	});
</script>
<!-- App Shell -->
<!-- svelte-ignore a11y-invalid-attribute -->
{#if carritoStore.isCartOpen}
	  <!-- svelte-ignore a11y-click-events-have-key-events -->
	  <!-- svelte-ignore a11y-no-static-element-interactions -->
	  <div class="popup" on:click={togglePopupCarro}>
		  <!-- svelte-ignore a11y-click-events-have-key-events -->
		  <!-- svelte-ignore a11y-no-static-element-interactions -->
		  <div class="popup-content" on:click|stopPropagation>
			  <!-- svelte-ignore a11y-click-events-have-key-events -->
			  <!-- svelte-ignore a11y-no-static-element-interactions -->
			  <span class="close text-4xl text-gray-600" on:click|stopPropagation={togglePopupCarro}>&times;</span>
			  <div class="w-full">
					<div class="flex">
						<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="green" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/></svg>
						<p class="ml-2">Lo que llevas en tu Carrito</p>
					</div>
					<div class="flex">
						<div class="relative overflow-hidden bg-gray-200 rounded-lg aspect-w-1 aspect-h-1 w-24 h-24 m-4">
							<img class="object-cover w-full h-full" src="{data.db[$carrito.productIndex].images[0]}" alt="producto agregado al carro" />
						</div>
						<div class="m-4">
							<p class="text-gray-600 uppercase">{data.db[$carrito.productIndex].brand}</p>
							<p class="capitalize">{data.db[$carrito.productIndex].title}</p>
						</div>
						<div class="m-4">${(data.db[$carrito.productIndex].price).toLocaleString()}</div>
						<div class="btn-group variant-filled m-4" style="height: 3rem;">
							<button on:click|preventDefault={() => removeFromCart(data.db[$carrito.productIndex].id, data.sessionId)}>-</button>
							<input type="text" style="width: 4rem;" bind:value={inputValue} disabled/>
							<button on:click|preventDefault={() => addToCart(data.db[$carrito.productIndex].id, data.sessionId)}>+</button>
						</div>
					</div>
					<div class="flex justify-end items-center mt-4">
						<a class="underline mr-4" href="#" on:click|stopPropagation|preventDefault={togglePopupCarro}>Seguir comprando</a>
						<a href="/carrito" class="btn variant-filled-primary">Ir al Carrito</a>
					</div>
			  </div>
		  </div>
	  </div>
  {/if}
	<Toast />
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/"><strong class="text-xl">SimpleCarrito</strong></a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div class="relative inline-block">
					<a
					class="btn variant-filled"
					href="/carrito"
					>
						<div>
							{#if carritoStore.cartItemCountTotal != 0}
							<span class="badge-icon variant-filled-primary absolute -top-0 -right-0 z-10 text-white">{carritoStore.cartItemCountTotal}</span>
							{/if}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" height="20" width="20"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
						</div>
					</a>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
<style>
	.popup {
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  background-color: rgba(0, 0, 0, 0.5);
	  z-index: 99999;
	  overflow-y: auto
	}
  
	@media (min-height: 685px) {
	  .popup-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	  }
	}
  
	@media (max-height: 684px) {
	  .popup-content {
		position: absolute;
		margin-top: 150px; /* distance from the top of the screen */
		left: 50%;
		transform: translate(-50%, 0);
	  }
	}
  
	.popup-content {
	  /* styles that apply to all screen sizes */
	  background-color: white;
	  color: #343a40;
	  text-align: justify;
	  padding: 20px;
	  border-radius: 10px;
	  width: 80%;
	  min-width: 337.5px;
	}
  
	@media (max-width: 1024px) {
	  .popup-content {
		height: 100%;
		width: 100%;
	  }
	}
  
	.close {
	  position: absolute;
	  top: 10px;
	  right: 10px;
	  cursor: pointer;
	}
	.text-white {
		color: #ffffff;
	}
</style>