// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from "../../config";
import { fetchPostJSONAuthed } from "../../utils/api-helpers";
import { formatAmountForStripe } from "../../utils/stripe-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { amount }: { amount: number } = req.body;

    try {
      // Validate the amount that was passed from the client.
      if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
        throw new Error("Invalid amount.");
      }
      let data = await fetchPostJSONAuthed(
        `${process.env
          .BTCPAY_URL!}stores/9PMMpizLnpWtBeHV5Y9iKLj14Ei5iuVSWxYeSSntnsDU/invoices`,
        `token ${process.env.BTCPAY_API_KEY}`,
        // TODO validate that we aren't fucking with the amount with floating point stuff
        { amount, currency: CURRENCY }
      );

      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
