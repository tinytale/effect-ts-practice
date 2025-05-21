import { Hono } from "hono";
import check from "./check/controller.js";

const app = new Hono().route("/", check);

export default app;
