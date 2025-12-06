import { appRouter } from "~~/server/trpc/routers";
import { createError, sendRedirect } from "h3";

interface ApiResponse {
  GatewayPageURL?: string;
  [key: string]: any;
}

export default defineEventHandler(async (event) => {
  // correct: useRuntimeConfig does not take the event
  const config = useRuntimeConfig();

  // create a caller for your RPCs (adjust context if your router expects it)
  const caller = appRouter.createCaller({});

  // 1. get or Create user
  let user;
  user = await caller.getUserByEmail({
    email: "test@example.com",
  });

  if (!user) {
    user = await caller.createUser({
      name: "Test User",
      email: "test@example.com",
    });
  }

  // 2. Create subscription
  // if your API expects amount in cents, pass an integer (e.g. 9.5 USD => 950 cents).
  // Here I'm demonstrating passing cents (950) — change if your createSubscription expects different units.
  const sub = await caller.createSubscription({
    userId: user.id,
    plan: "monthly",
    amountCents: 9.99,
  });

  // 3. Create invoice
  const inv = await caller.createInvoice({
    subscriptionId: sub.id,
  });

  // 4. Create SSLCommerz payment payload
  const store_id = config.ssl.storeId;
  const store_passwd = config.ssl.storePasswd;
  // const is_live = false;

  const paymentData = new URLSearchParams({
    store_id,
    store_passwd,

    total_amount: String(inv.amountCents),
    currency: inv.currency ?? "BDT",
    tran_id: inv.invoiceNumber,

    success_url: `${config.public.appUrl}/api/sslcommerz/success/${inv.invoiceNumber}`,
    fail_url: `${config.public.appUrl}/api/sslcommerz/fail/${inv.invoiceNumber}`,
    cancel_url: `${config.public.appUrl}/api/sslcommerz/cancel/${inv.invoiceNumber}`,
    ipn_url: `${config.public.appUrl}/api/sslcommerz/ipn`,

    cus_name: user.name,
    cus_email: user.email,
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",

    shipping_method: "NO",

    product_name: "Subscription",
    product_category: "Software",
    product_profile: "general",
  });

  try {
    console.log("paymentData", paymentData);

    // const sslcz = new SSLCommerz(store_id, store_passwd, is_live);
    // const apiResponse = await sslcz.init(paymentData);
    // Call SSLCommerz API to initiate payment
    const apiResponse = await $fetch<ApiResponse>(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      {
        method: "POST",
        body: paymentData,
        headers: {
          // cors headers if needed
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("SSLCommerz initiation response:", apiResponse);

    if (!apiResponse || !apiResponse.GatewayPageURL) {
      // include returned object in message for easier debugging
      throw createError({
        statusCode: 502,
        statusMessage:
          "SSLCommerz returned an unexpected response (no GatewayPageURL).",
      });
    }

    // redirect user to gateway
    return { ok: true, GatewayPageURL: apiResponse.GatewayPageURL };
  } catch (err: any) {
    // include underlying message for debugging (but avoid leaking secrets in production)
    throw createError({
      statusCode: 500,
      statusMessage:
        "Failed to initiate SSLCommerz payment" +
        (err?.message ? `: ${err.message}` : ""),
    });
  }
});
