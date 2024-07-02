import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { buildTools, getExecutor } from "./executor";

const MONDAY_KEY = process.env.MONDAY_KEY!;
const STRIPE_KEY = process.env.STRIPE_KEY!;
const RESEND_KEY = process.env.RESEND_KEY!;
const SLACK_KEY = process.env.SLACK_KEY!;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", async function (req: express.Request, res: express.Response) {
  res.json({ ok: true });
});

app.post(
  "/query",
  async function (req: express.Request, res: express.Response) {
    const body = req.body;

    const tools = buildTools({
      MONDAY_KEY,
      STRIPE_KEY,
      SLACK_KEY,
      RESEND_KEY,
    });

    const executor = await getExecutor(tools);

    try {
      const result = await executor.invoke({ input: body.query });

      return res.json({ result: result?.output });
    } catch (error: any) {
      return res.json({ error: error?.message });
    }
  }
);

app.listen(3000);
