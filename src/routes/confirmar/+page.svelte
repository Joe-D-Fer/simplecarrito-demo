<script lang="ts">
  export let data;

  let submitting = false;
  async function createTransaction() {
    submitting = true;
    const SID = data.verifiedSid;
    const dataToSend = { SID };
		const response = await fetch('/createTransaction', {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dataToSend }),
		});
		if (response.ok) {
				console.log("transaccion creada.");
		} else {
				console.log("error al crear transaccion...");
		}
  }
  function calculateItemCountPrice(cart: { quantity: number; price: number; }[]) {
    let cartItemCountTotal = 0;
    let totalPrice = 0;
    cart.forEach((product: { quantity: number; price: number; }) => {
      cartItemCountTotal += product.quantity;
      totalPrice += product.price * product.quantity;
    });
    return {
      cartItemCountTotal,
      totalPrice
    }
  }

  const verifiedData = calculateItemCountPrice(data.verifiedCart.productsList);
  const verifiedCartItemCountTotal = verifiedData.cartItemCountTotal;
  const verifiedTotalPrice = verifiedData.totalPrice;
</script>
<div class="grid grid-cols-12 gap-4 w-full">
  <div class="col-span-12 lg:col-span-8">
  
    <div class="flex items-center mt-4 pt-4 ml-1 pl-1 lg:ml-4 lg:pl-4 w-full">
      <p class="h3 mr-4">Confirma tu Compra</p>
    </div>
  
    <div class="flex justify-center p-1 m-1 lg:pl-4 lg:ml-4" style="margin-bottom: 200px;">
      <div class="bg-white rounded-lg w-full">
          <div class="grid grid-cols-12 gap-4 w-full">
            {#each data.verifiedCart.productsList as producto}
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

              <div class="relative px-0 col-span-9 lg:col-span-3 flex items-center">
                <div class="absolute right-0 pr-2">
                  <p class="h1 text-gray-600">x {producto.quantity}</p>
                </div>
              </div>
            {/each}
          </div>
      </div>
    </div>
  </div>
  <div class="col-span-12 lg:col-span-4">
    <div class="flex items-center mt-4 pt-4 p-1 m-1 hidden lg:block">
      <p class="h3 mr-4">Resumen de la Compra</p>
    </div>
    <div class="flex justify-center w-full absolute bottom-0 lg:static lg:mr-4 lg:pr-4">
      <div class="bg-white rounded-lg w-full p-4">
        {#if (verifiedCartItemCountTotal == 1)}
          <span class="text-gray-800 h5">&#40;1 Producto&#41;</span>
        {:else}
          <span class="text-gray-800 h5">&#40;{verifiedCartItemCountTotal} Productos&#41;</span>
        {/if}
        <div class="flex justify-between pb-4">
          <p class="h5 text-gray-800 font-bold">Total:</p>
          <p class="h5 text-gray-800 font-bold">${verifiedTotalPrice.toLocaleString()}</p>
        </div>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <button class="btn bg-gradient-to-br variant-gradient-tertiary-secondary text-white font-bold w-full" disabled={submitting} on:click|preventDefault={createTransaction}>Ir a Pagar</button>
      </div>
    </div>
  </div>
</div>