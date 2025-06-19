export function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",").shift()?.trim() ||
    req.socket?.remoteAddress ||
    null;

  // Normalize or ignore localhost IPs in dev
  if (ip === "::1" || ip === "127.0.0.1") ip = null;

  return ip;
}
