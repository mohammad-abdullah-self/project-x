import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "~~/server/routes/rpc/router";

export default defineNuxtPlugin(() => {
  const link = new RPCLink({
    url: `${
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"
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
