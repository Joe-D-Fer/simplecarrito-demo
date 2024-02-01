<script>
	import { onMount } from 'svelte';

  export let data;
  onMount(() => {
    console.log("data from product with param", data);
  });
</script>
<h1>producto</h1>