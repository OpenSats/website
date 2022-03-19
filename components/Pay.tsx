import { useState } from "react";
import useSWR from "swr";
import { fetchPostJSON } from "../utils/api-helpers";

const Pay = ({ amount = 100.0 }) => {
  //   const [stripeUrl, setStripeUrl] = useState("");
  const [btcpayUrl, setBtcPayUrl] = useState("");

  const { data: stripe } = useSWR(
    ["/api/stripe_checkout", { amount }],
    fetchPostJSON
  );

  return <p>{stripe && stripe.url}</p>;
};

export default Pay;
