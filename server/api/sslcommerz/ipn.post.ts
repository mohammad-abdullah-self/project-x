// server/api/ipn.post.ts
import { defineEventHandler, readBody } from "h3";
import { appRouter } from "~~/server/trpc/routers";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log("IPN received with body:", body);

    // Basic IPN fields (as described by SSLCOMMERZ)
    const {
      status,
      tran_id,
      val_id,
      // amount,
      // store_amount,
      // verify_sign,
      // verify_key,
      // currency,
      // bank_tran_id,
      // card_type,
      // card_no,
      // value_a,
      // value_b,
      // value_c,
      // value_d,
    } = body as Record<string, any>;

    // Log the IPN (use a rotating logger or DB in production)
    // console.info("SSLCOMMERZ IPN received:", {
    //   tran_id,
    //   val_id,
    //   status,
    //   amount,
    //   currency,
    // });

    // Minimal checks: ensure required keys are present
    if (!tran_id || !val_id || !status) {
      // Bad request — return 400 (or any text). SSLCOMMERZ expects any response; but 200 is safe when processed.
      throw createError({
        statusCode: 500,
        statusMessage: "Missing required IPN parameters",
      });
      // return { ok: false, message: "Missing required IPN parameters" };
    }

    // If status is FAILED/CANCELLED/EXPIRED - handle accordingly
    // But still validate with validation API for security.
    // Use runtime config or environment variables for credentials
    const config = useRuntimeConfig(event); // expects runtime config set: ssl.storeId and ssl.storePassword
    const storeId = config.ssl.storeId;
    const storePass = config.ssl.storePasswd;

    if (!storeId || !storePass) {
      throw createError({
        statusCode: 500,
        statusMessage: "Server misconfigured",
      });
    }

    // Build validation URL (GET)
    const validationBase =
      "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

    const params = new URLSearchParams({
      val_id: String(val_id),
      store_id: String(storeId),
      store_passwd: String(storePass),
      v: "1",
      format: "json",
    });

    const validationUrl = `${validationBase}?${params.toString()}`;

    // Call validation API
    const resp = await $fetch(validationUrl, { method: "GET" }).catch((err) => {
      console.error("Validation API call failed", err);
      throw err;
    });

    console.log("Validation API response:", resp);

    // resp should be parsed JSON per doc
    const validation = resp as any;

    // Basic checks according to SSLCOMMERZ:
    // status should be VALID or VALIDATED (VALIDATED if re-called)
    const validStatuses = ["VALID", "VALIDATED"];
    const validationStatus: string = (validation?.status ?? "").toString();

    if (!validStatuses.includes(validationStatus)) {
      console.warn(
        "Transaction validation failed at SSLCOMMERZ:",
        validationStatus,
        { validation }
      );
      // update DB as failed/invalid if you want
      // respond success (200) to IPN sender (SSLCOMMERZ)
      throw createError({
        statusCode: 500,
        statusMessage: "Transaction not valid at SSL end",
      });
    }

    // create a caller for your RPCs (adjust context if your router expects it)
    const caller = appRouter.createCaller({});

    // 1. Create ipn logs
    await caller.createIpn({
      tranId: String(tran_id),
      rawPayload: JSON.stringify(resp),
    });

    await caller.updateInvoiceStatus({
      tranId: String(tran_id),
      status: "paid",
    });
    return { ok: true };
  } catch (err) {
    console.error("IPN handler error", err);
    // return generic message; do not leak sensitive details
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
