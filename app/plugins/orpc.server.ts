import { createRouterClient } from "@orpc/server";
import { router } from "~~/server/router";

export default defineNuxtPlugin((nuxt) => {
  const event = useRequestEvent();

  const orpc = createRouterClient(router, {
    context: {
      headers: event?.headers, // provide headers if initial context required
    },
  });

  return {
    provide: {
      orpc,
    },
  };
});
