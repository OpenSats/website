import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { fetchPostJSON } from "../utils/api-helpers";

const Pay = ({ amount = 100.0 }) => {
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
    <div className="flex flex-col space-y-4">
      {stripe?.url && (
        <Link href={stripe.url} passHref={true}>
          <button className="border-2 border-black bg-white p-8 text-xl text-black hover:text-primary rounded-xl flex justify-start gap-4" role="link">
            <FontAwesomeIcon icon={faCreditCard} className="text-primary h-8 w-8" />
            Pay with card
          </button>
        </Link>
      )}
      {stripeError && <mark>{stripeError?.message}</mark>}
      {/* <mark>Error: {stripeError?.message}</mark> */}
      {btcpay?.url && (
        <Link href={btcpay.url} passHref={true}>
          <button className="border-2 border-black bg-white p-8 text-xl text-black hover:text-primary rounded-xl flex justify-start gap-4" role="link">
            <FontAwesomeIcon icon={faBitcoin} className="text-primary h-8 w-8" />
            Pay with Bitcoin
          </button>
        </Link>
      )}
      {btcpayError && <mark>{btcpayError?.message}</mark>}
    </div>
  );
};

export default Pay;
