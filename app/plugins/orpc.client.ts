import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { router } from "~~/server/router";

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const event = useRequestEvent();

  const link = new RPCLink({
    url: `${
      typeof window !== "undefined"
        ? window.location.origin
        : runtimeConfig.public.appUrl
    }/rpc`,
    headers: event?.headers,
  });

  // Use this for server-side calls
  //   const orpc = createRouterClient(router);

  // Fallback to this for client-side calls
  const orpc: RouterClient<typeof router> = createORPCClient(link);

  return {
    provide: {
      orpc,
    },
  };
});
