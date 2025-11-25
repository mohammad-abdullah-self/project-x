export function useORPC() {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$client;
}
