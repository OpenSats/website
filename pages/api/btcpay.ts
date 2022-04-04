// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from "../../config";
import { fetchPostJSONAuthed } from "../../utils/api-helpers";
import { PayReq } from "../../utils/types";

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
      let data = await fetchPostJSONAuthed(
        `${process.env
          .BTCPAY_URL!}stores/${process.env.BTCPAY_STORE_ID}/invoices`,
        `token ${process.env.BTCPAY_API_KEY}`,
        { amount, currency: CURRENCY, metadata: { orderId: project_slug, project_name, buyerName: name || "anonymous", email: email || "none" }, checkout: { redirectURL: REDIRECT } }
      );

      console.log({ data })

      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: (err as Error).message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
