import { os } from "@orpc/server";

export const hello = os.handler(async () => {
  return "Hello world from orpc";
});

export default {
  hello,
};
