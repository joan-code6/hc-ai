import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { proxy } from "hono/proxy";

import { env } from "../../../env";
import { requireApiKey } from "../../../middleware/auth";
import type { AppVariables } from "../../../types";
import { moderationsLimiter } from "../shared";

const moderations = new Hono<{ Variables: AppVariables }>();

moderations.post(
  "/moderations",
  requireApiKey,
  moderationsLimiter,
  async (c) => {
    const modKey = env.OPENAI_MODERATION_API_KEY || env.OPENAI_API_KEY;
    const modUrl =
      env.OPENAI_MODERATION_API_URL || "https://api.openai.com/v1/moderations";

    if (!modKey) {
      throw new HTTPException(503, {
        message: "Moderation API key is not configured",
      });
    }

    return proxy(modUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${modKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(await c.req.json()),
    });
  },
);

export default moderations;
