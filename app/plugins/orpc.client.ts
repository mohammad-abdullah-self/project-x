import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "~~/server/router";

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();

  const link = new RPCLink({
    url: `${
      typeof window !== "undefined"
        ? window.location.origin
        : runtimeConfig.public.appUrl
    }/rpc`,
    headers: () => ({}),
  });

  const client: RouterClient<typeof router> = createORPCClient(link);

  return {
    provide: {
      client,
    },
  };
});
