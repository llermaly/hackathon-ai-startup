import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import axios from "axios";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { z } from "zod";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { pull } from "langchain/hub";
import type { ChatPromptTemplate } from "@langchain/core/prompts";

interface FetchProps {
  headers: any;
  query?: any;
  body?: any;
}

const GET_TASKS_QUERY = (boardId: string) => `query {
  boards (ids: ${boardId}){
    allItems:items_page (limit: 10) {
      cursor
      items {
        id
        name
         itemData:column_values {
          column{
            title
          }
          text
        }
      }
    }
  }
}


`;

const GET_MONDAY_BOARDS = `query {
  boards{
    id
    name
  }
}`;

const fetchMonday = async ({ headers, query }: FetchProps) => {
  const { data } = await axios.post(
    "https://api.monday.com/v2",
    {
      query,
    },
    {
      headers,
    }
  );

  return data;
};

const fetchResend = async ({ headers, body }: FetchProps) => {
  const { data } = await axios.post("https://api.resend.com/emails", body, {
    headers,
  });

  return data;
};

const fetchStripePaymentLink = async ({ headers, body }: FetchProps) => {
  const { data } = await axios.post(
    "https://api.stripe.com/v1/payment_links",
    body,
    {
      headers,
    }
  );

  return data;
};

interface ToolProps {
  MONDAY_KEY: string;
  SLACK_KEY: string;
  STRIPE_KEY: string;
  RESEND_KEY: string;
}

export const buildTools = ({
  MONDAY_KEY,
  SLACK_KEY,
  STRIPE_KEY,
  RESEND_KEY,
}: ToolProps): any => [
  new DynamicStructuredTool({
    name: "get-monday-boards",
    description:
      "Get all the boards names and ids in Monday, usefull to get the boardsIds to use in other queries",
    schema: z.object({}),
    func: async () => {
      const data = await fetchMonday({
        headers: {
          Authorization: MONDAY_KEY,
          "Content-Type": "application/json",
        },
        query: GET_MONDAY_BOARDS,
      });

      return JSON.stringify(data?.data?.boards);
    },
  }),
  new DynamicStructuredTool({
    name: "get-monday-tasks",
    description:
      "Get all the tasks in Monday, receives a boardId as input, if you don't know the boardId you can use the get-monday-boards tool to get it",
    schema: z.object({
      boardId: z.string(),
    }),
    func: async ({ boardId }) => {
      const data = await fetchMonday({
        headers: {
          Authorization: MONDAY_KEY,
          "Content-Type": "application/json",
        },
        query: GET_TASKS_QUERY(boardId),
      });

      const findColumn = (itemData: any, title: string) =>
        itemData.find((c: any) => c?.column?.title === title)?.text;

      return JSON.stringify(
        data?.data?.boards[0]?.allItems?.items?.map((i: any) => ({
          id: i.id,
          name: i.name,
          status: findColumn(i.itemData, "Status"),
          dueDate: findColumn(i.itemData, "Due Date"),
          owner: findColumn(i.itemData, "Owner"),
          timeline: findColumn(i.itemData, "Timeline"),
        }))
      );
    },
  }),
  new DynamicStructuredTool({
    name: "send-slack-message",
    description:
      "Send a message to a slack channel, receives a message and channel as input",
    schema: z.object({
      message: z.string(),
      channel: z.string(),
    }),
    func: async ({ message, channel }) => {
      const { data } = await axios.post(
        "https://slack.com/api/chat.postMessage",
        { text: message, channel: channel },
        {
          headers: {
            Authorization: `Bearer ${SLACK_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return `Succesfully sent message to slack ${channel} channel!`;
    },
  }),
  new DynamicStructuredTool({
    name: "get-stripe-products",
    description:
      "Returns the price ids and names of all the products in Stripe, usefull to get the priceId to use in other queries",
    schema: z.object({}),
    func: async ({}) => {
      const credentials = `${STRIPE_KEY}:`;
      const encodedCredentials = Buffer.from(credentials).toString("base64");

      const { data } = await axios.get("https://api.stripe.com/v1/products", {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
      });

      return JSON.stringify(
        data?.data?.map((p: any) => ({
          priceId: p.default_price,
          name: p.name,
        }))
      );
    },
  }),
  new DynamicStructuredTool({
    name: "generate-stripe-payment-link",
    description:
      "Generate a payment link for a product in Stripe, receives a priceId and quantity as input and returns the payment link url",
    schema: z.object({
      priceId: z.string(),
      quantity: z.number().default(1),
    }),
    func: async ({ priceId, quantity }) => {
      const credentials = `${STRIPE_KEY}:`;
      const encodedCredentials = Buffer.from(credentials).toString("base64");

      const data = await fetchStripePaymentLink({
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: {
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": quantity,
        },
      });

      return JSON.stringify(data?.url);
    },
  }),
  new DynamicStructuredTool({
    name: "send-email",
    description:
      "Send an email, receives a subject, body, and recipient as input",
    schema: z.object({
      subject: z.string(),
      body: z.string(),
      recipient: z.string(),
    }),
    func: async ({ subject, body, recipient }) => {
      const reqBody = {
        from: "dev@fusion-ai-experts.com",
        to: recipient,
        subject,
        html: body,
      };

      const data = await fetchResend({
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
        },
        body: reqBody,
      });

      return JSON.stringify(data);
    },
  }),
];

const llm = new ChatOpenAI({
  temperature: 0,
  model: "gpt-4o",
  verbose: true,
});

export const getExecutor = async (tools: any) => {
  const prompt = await pull<ChatPromptTemplate>(
    "hwchase17/openai-functions-agent"
  );

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  return agentExecutor;

  return await PlanAndExecuteAgentExecutor.fromLLMAndTools({
    llm,
    tools,
  });
};
