<script lang="ts">
  import { onMount } from "svelte";
  import { carrito } from "../stores";
  export let data;

  onMount(() => {
    $carrito.cartItemCountTotal = 0;
  });
</script>
<h1>pago aceptado</h1>