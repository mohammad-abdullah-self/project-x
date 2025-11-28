import { defineEventHandler, getRequestURL } from "h3";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const host = url.hostname; // e.g. tenant1.example.com
  console.log("host", host);

  // Adjust logic depending on domain shape:
  const parts = host.split(".");
  let tenantId = null;
  // if domain is tenant.domain.com
  if (parts.length) {
    tenantId = parts[0];
  } else if (event.node.req.headers["x-tenant-id"]) {
    // fallback header for mobile apps or non-subdomain requests
    tenantId = event.node.req.headers["x-tenant-id"] as string;
  } else {
    tenantId = "public"; // or throw/redirect
  }

  // attach to event context
  (event as any).context = {
    ...(event as any).context,
    tenantId,
  };
});
