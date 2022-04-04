import { NextApiRequest, NextApiResponse } from "next";

import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from "../../config";
import { formatAmountForStripe } from "../../utils/stripe-helpers";

import Stripe from "stripe";
import { PayReq } from "../../utils/types";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2020-08-27",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { amount, project_name, project_slug, email, name }: PayReq = req.body;
    const REDIRECT = "localhost:3000"

    try {
      // Validate the amount that was passed from the client.
      if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
        throw new Error("Invalid amount.");
      }
      // Create PaymentIntent from body params.
      const params: Stripe.PaymentIntentCreateParams = {
        payment_method_types: ["card"],
        amount: formatAmountForStripe(amount, CURRENCY),
        currency: CURRENCY,
        description: `OpenSats donation: ${project_name}`,
      };
      const payment_intent: Stripe.PaymentIntent =
        await stripe.paymentIntents.create(params);

      res.status(200).json(payment_intent);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
