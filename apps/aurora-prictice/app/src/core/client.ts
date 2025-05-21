import app from "@/index";
import { hc } from "hono/client";

export const api = hc<typeof app>

