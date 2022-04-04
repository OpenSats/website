import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { fetchPostJSON } from "../utils/api-helpers";
import Spinner from "./Spinner";

export type PayProps = {
  amount: number;
  projectSlug: string;
  projectNamePretty: string;
  readyToPay: boolean;
}


const Pay: React.FC<PayProps> = ({ amount, projectSlug, projectNamePretty, readyToPay }) => {
  const [btcPayLoading, setBtcpayLoading] = useState(false);
  const [fiatLoading, setFiatLoading] = useState(false);

  async function handleClickBtcPay() {
    setBtcpayLoading(true);
    try {
      const data = await fetchPostJSON("/api/btcpay", { amount, project_slug: projectSlug, project_name: projectNamePretty })
      window.open(data.checkoutLink);
      if (data.checkoutLink) {
        window.open(data.url);
      } else {
        throw new Error("Something went wrong with BtcPay Server checkout.")
      }
    } catch (e) {
      console.error(e);
    }
    setBtcpayLoading(false);
  };

  async function handleClickFiat() {
    setFiatLoading(true);
    try {
      const data = await fetchPostJSON("/api/stripe_checkout", { amount, project_slug: projectSlug, project_name: projectNamePretty })
      if (data.url) {
        window.open(data.url);
      } else {
        throw new Error("Something went wrong with Stripe checkout.")
      }
    } catch (e) {
      console.error(e);
    }
    setFiatLoading(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button onClick={handleClickBtcPay} className="pay" disabled={readyToPay || btcPayLoading}>
        {btcPayLoading ? <Spinner /> : <FontAwesomeIcon icon={faBitcoin} className="text-primary h-8 w-8" />}
        <span className="whitespace-nowrap">
          Donate with Bitcoin
        </span>
      </button>
      <button onClick={handleClickFiat} className="pay" disabled={readyToPay || fiatLoading}>
        {fiatLoading ? <Spinner /> : <FontAwesomeIcon icon={faCreditCard} className="text-primary h-8 w-8" />}
        <span className="whitespace-nowrap">
          Donate with fiat
        </span>
      </button>
    </div>
  );
};

export default Pay;
