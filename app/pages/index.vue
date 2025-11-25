<script setup lang="ts">
const client = useORPC();
// const greeting = await client.greeting.greeting({ name: "Jhon" });
const helloFromOrpc = await client.hello.hello();
const { data: helloFromApi } = await useFetch("/api/hello", {
  server: false,
});
</script>
<template>
  <h1>New Index page</h1>
  <!-- <pre>Greeting: {{ greeting }}</pre> -->
  <pre>Hello ORPC: {{ helloFromOrpc }}</pre>
  <pre>Hello API: {{ helloFromApi }}</pre>
</template>
