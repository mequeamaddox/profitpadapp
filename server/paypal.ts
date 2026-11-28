import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
  PaypalExperienceUserAction,
  PaypalWalletContextShippingPreference,
} from "@paypal/paypal-server-sdk";
import {
  isBillingPeriod,
  isPaidPlanId,
  planPrice,
  type BillingPeriod,
  type PaidPlanId,
} from "@shared/plans";

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
  // No SDK request logging: it prints the Authorization header, which
  // contains the client id and secret.
});
const ordersController = new OrdersController(client);

/* Plan purchases
 *
 * The price comes from PAID_PLAN_PRICES on the server, and the buyer's user
 * id, plan and billing period are stamped on the order as custom_id, so a
 * capture can be checked against who is capturing it and what they paid.
 */

function planCustomId(userId: string, plan: PaidPlanId, period: BillingPeriod) {
  return `${userId}:${plan}:${period}`;
}

/**
 * Creates an order for a plan and returns the PayPal checkout page to send
 * the buyer to. PayPal sends them back to returnUrl (with ?token=<order id>)
 * once they approve, or to cancelUrl if they back out.
 */
export async function createPlanCheckout(
  userId: string,
  plan: PaidPlanId,
  period: BillingPeriod,
  returnUrl: string,
  cancelUrl: string,
): Promise<string> {
  const { body } = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: planPrice(plan, period),
          },
          customId: planCustomId(userId, plan, period),
          description: `ProfitPad ${plan} plan (${period})`,
        },
      ],
      paymentSource: {
        paypal: {
          experienceContext: {
            brandName: "ProfitPad",
            userAction: PaypalExperienceUserAction.PayNow,
            shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
            returnUrl,
            cancelUrl,
          },
        },
      },
    },
    prefer: "return=representation",
  });

  const order = JSON.parse(String(body));
  const link = (order?.links ?? []).find(
    (l: { rel?: string; href?: string }) => l.rel === "payer-action" || l.rel === "approve",
  );
  if (!link?.href) {
    throw new Error("PayPal did not return a checkout link");
  }
  return link.href;
}

/** True when PayPal refused a capture because the order was already captured. */
export function isAlreadyCaptured(error: unknown): boolean {
  const e = error as { statusCode?: number; body?: unknown };
  return e?.statusCode === 422 && String(e.body ?? "").includes("ORDER_ALREADY_CAPTURED");
}

export type PlanCaptureResult =
  | { ok: true; plan: PaidPlanId; period: BillingPeriod; captureId: string }
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
  const [orderUserId, plan, period] = customId.split(":");
  if (orderUserId !== userId || !isPaidPlanId(plan) || !isBillingPeriod(period)) {
    return { ok: false, reason: "Order does not belong to this user" };
  }

  if (
    capture.amount?.currency_code !== "USD" ||
    capture.amount?.value !== planPrice(plan, period)
  ) {
    return { ok: false, reason: "Paid amount does not match the plan price" };
  }

  return { ok: true, plan, period, captureId: capture.id };
}

/** A loggable summary of a PayPal SDK error that never includes request headers. */
export function describePaypalError(error: unknown): string {
  const e = error as { statusCode?: number; body?: unknown; message?: string };
  if (e?.statusCode) {
    return `PayPal ${e.statusCode}: ${typeof e.body === "string" ? e.body : JSON.stringify(e.body)}`;
  }
  return e?.message || String(error);
}
