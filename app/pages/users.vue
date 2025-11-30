<script setup>
import { ref, computed } from "vue";

const { $trpc } = useNuxtApp();
const page = ref(1);
const pageSize = 10;

// make the params reactive so useQuery will re-run when page changes
const params = computed(() => ({ page: page.value, pageSize }));

// pass a computed ref; many tRPC composables watch the param and refetch
const { data: users, isLoading, error, refetch } = $trpc.users.useQuery(params);

// client-side increment
function nextPage() {
  page.value += 1;
}
function prevPage() {
  if (page.value > 1) page.value -= 1;
}
</script>

<template>
  <div class="card flex justify-between items-center">
    <Button
      :label="'Prev'"
      @click="prevPage"
      :disabled="page === 1 || isLoading"
    />
    <div>Page: {{ page }}</div>
    <Button :label="'Next'" @click="nextPage" :disabled="isLoading" />
  </div>

  <div class="card mt-4">
    <DataTable :value="users" tableStyle="min-width: 50rem">
      <Column field="id" header="ID" />
      <Column field="name" header="Name" />
      <Column field="email" header="Email" />
      <Column field="age" header="Age" />
      <Column field="createdAt" header="CreatedAt" />
    </DataTable>
    <div v-if="isLoading">Loading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
  </div>
</template>
