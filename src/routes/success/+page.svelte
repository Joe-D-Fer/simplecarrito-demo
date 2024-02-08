<script lang="ts">
	import { onMount } from "svelte";
  import { carrito } from "../stores";
  export let data;

  function updateCount() {
    $carrito.cartItemCountTotal = 0;
    console.log("my store:", $carrito);
  }
  onMount(() => {
    updateCount();
    console.log("my store on mount:", $carrito);//count will not be 0
    setTimeout(() => {
      updateCount();
    }, 1);
  });
</script>
<p>Pago Recibido</p>