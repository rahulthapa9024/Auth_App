import type { JwtPayload } from "jsonwebtoken";
import { createHash } from "crypto";
import { redis } from "../config/redis";

const TOKEN_BLACKLIST_PREFIX = "blacklistedToken:";
const DEFAULT_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const getTokenBlacklistKey = (token: string) => {
  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  return `${TOKEN_BLACKLIST_PREFIX}${tokenHash}`;
};

const getTokenTtlSeconds = (decoded: string | JwtPayload | null) => {
  if (
    decoded &&
    typeof decoded !== "string" &&
    typeof decoded.exp === "number"
  ) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    return ttl > 0 ? ttl : 0;
  }

  return DEFAULT_TOKEN_TTL_SECONDS;
};

const blacklistToken = async (
  token: string,
  decoded: string | JwtPayload | null
) => {
  const ttl = getTokenTtlSeconds(decoded);

  if (ttl <= 0) {
    return;
  }

  await redis.setEx(
    getTokenBlacklistKey(token),
    ttl,
    "true"
  );
};

const isTokenBlacklisted = async (token: string) => {
  const blacklistedToken = await redis.get(
    getTokenBlacklistKey(token)
  );

  return Boolean(blacklistedToken);
};

export { blacklistToken, isTokenBlacklisted };
