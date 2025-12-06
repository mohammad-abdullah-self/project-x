export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const tranId = getRouterParam(event, "tranId");
  const body = await readBody(event);
  console.log("Cancellation requested for tranId:", tranId, "with body:", body);

  return await sendRedirect(
    event,
    `${config.public.appUrl}/cancel/${tranId}`,
    302
  );
});
