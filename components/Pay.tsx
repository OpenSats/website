import { useState } from "react";
import useSWR from "swr";
import { fetchPostJSON } from "../utils/api-helpers";

const Pay = ({ amount = 100.0 }) => {
  //   const [stripeUrl, setStripeUrl] = useState("");

  const { data: stripe, error: stripeError } = useSWR(
    ["/api/stripe_checkout", { amount }],
    fetchPostJSON
  );

  const { data: btcpay, error: btcpayError } = useSWR(
    ["/api/btcpay", { amount }],
    fetchPostJSON
  );

  console.log(btcpayError);

  return (
    <div>
      {stripe?.url && (
        <p>
          <a href={stripe.url}>Pay with card</a>
        </p>
      )}
      {stripeError && <mark>heyo</mark>}
      <mark>Error: {stripeError?.message}</mark>
      {btcpay?.url && (
        <p>
          <a href={btcpay.url}>Pay with Bitcoin</a>
        </p>
      )}
      <mark>Error: {btcpayError}</mark>
    </div>
  );
};

export default Pay;
