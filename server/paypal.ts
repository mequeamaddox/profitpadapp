import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";
import { PAID_PLAN_PRICES, type PaidPlanId } from "@shared/plans";

/* PayPal Controllers Setup */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID) {
  throw new Error("Missing PAYPAL_CLIENT_ID");
}
if (!PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PAYPAL_CLIENT_SECRET");
}
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});
const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);

/* Token generation helpers */

export async function getClientToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

export async function loadPaypalDefault(_req: Request, res: Response) {
  const clientToken = await getClientToken();
  res.json({
    clientToken,
  });
}

/* Plan purchases
 *
 * The price comes from PAID_PLAN_PRICES on the server, and the buyer's user
 * id and plan are stamped on the order as custom_id, so a capture can be
 * checked against who is capturing it and what they paid.
 */

function planCustomId(userId: string, plan: PaidPlanId) {
  return `${userId}:${plan}`;
}

export async function createPlanOrder(
  userId: string,
  plan: PaidPlanId,
): Promise<string> {
  const { body } = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: PAID_PLAN_PRICES[plan],
          },
          customId: planCustomId(userId, plan),
          description: `ProfitPad ${plan} plan`,
        },
      ],
    },
    prefer: "return=minimal",
  });

  const order = JSON.parse(String(body));
  if (!order?.id) {
    throw new Error("PayPal did not return an order id");
  }
  return order.id;
}

export type PlanCaptureResult =
  | { ok: true; plan: PaidPlanId; captureId: string }
  | { ok: false; reason: string };

export async function capturePlanOrder(
  orderId: string,
  userId: string,
): Promise<PlanCaptureResult> {
  const { body } = await ordersController.captureOrder({
    id: orderId,
    prefer: "return=representation",
  });
  const order = JSON.parse(String(body));

  if (order?.status !== "COMPLETED") {
    return { ok: false, reason: `Order status is ${order?.status}` };
  }

  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture || capture.status !== "COMPLETED") {
    return { ok: false, reason: "Payment was not completed" };
  }

  const customId: string = capture.custom_id ?? order.purchase_units?.[0]?.custom_id ?? "";
  const [orderUserId, plan] = customId.split(":");
  if (orderUserId !== userId || !(plan in PAID_PLAN_PRICES)) {
    return { ok: false, reason: "Order does not belong to this user" };
  }

  const paidPlan = plan as PaidPlanId;
  if (
    capture.amount?.currency_code !== "USD" ||
    capture.amount?.value !== PAID_PLAN_PRICES[paidPlan]
  ) {
    return { ok: false, reason: "Paid amount does not match the plan price" };
  }

  return { ok: true, plan: paidPlan, captureId: capture.id };
}
