<script setup lang="ts">
interface ApiResponse {
  GatewayPageURL: string;
  ok: boolean;
}
async function startSubscription() {
  try {
    alert("Subscription initiated! Please complete the payment.");
    const response = await $fetch<ApiResponse>("/api/sslcommerz/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await navigateTo(response.GatewayPageURL, {
      external: true,
    });
  } catch (error) {
    console.error("Error initiating subscription:", error);
    alert("Failed to initiate subscription. Please try again.");
  }
}
</script>

<template>
  <div>
    <button type="button" @click="startSubscription">Pay 9.99 BDT</button>
  </div>
</template>
