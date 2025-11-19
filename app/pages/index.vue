<script setup lang="ts">
const { $client } = useNuxtApp();
const planets = await $client.planet.list();
</script>
<template>
  <h1>New Index page.</h1>
  <pre>{{ JSON.stringify(planets) }}</pre>
</template>
