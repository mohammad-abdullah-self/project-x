<script setup lang="ts">
const { $trpc, $orpc } = useNuxtApp();

// const greeting = await client.greeting.greeting({ name: "Jhon" });
const helloFromOrpc = await $orpc.hello.hello();
console.log("helloFromOrpc", helloFromOrpc);
const { data: helloFromApi } = await useFetch("/api/hello", {
  server: false,
});

const { data: helloFromTrpc } = await $trpc.hello.useQuery({
  text: "world from TRPC",
});
console.log("helloFromTrpc", helloFromTrpc.value?.greeting);

const { data: tenantUsers } = await $trpc.tenantUsers.useQuery();
</script>
<template>
  <h1>New Index page</h1>
  <!-- <pre>Greeting: {{ greeting }}</pre> -->
  <pre>Hello ORPC: {{ helloFromOrpc }}</pre>
  <pre>Hello API: {{ helloFromApi }}</pre>
  <pre>Hello TRPC: {{ helloFromTrpc?.greeting }}</pre>
  <pre>Tenant Users: {{ JSON.stringify(tenantUsers) }}</pre>
</template>
