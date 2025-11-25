import { os } from "@orpc/server";
import * as z from "zod";

export const greeting = os
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async ({ context, input }) => {
    return `Hello ${input.name}`;
  });

export default {
  greeting,
};
