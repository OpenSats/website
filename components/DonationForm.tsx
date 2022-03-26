import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { faDollar, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Pay from "./Pay";

const DonationSteps = () => {

    const [deductable, setDeductable] = useState("yes");
    const [amount, setAmount] = useState("")
    const [fiat, setFiat] = useState(true)

    const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeductable(event.target.value);
    };

    function handleFiatAmountClick(e: React.MouseEvent, value: string) {
        e.preventDefault();
        setAmount(value)
    }

    function handleSatsAmountClick(e: React.MouseEvent, value: string) {
        e.preventDefault();
        setAmount(value)
    }

    function handleToggleFiat(e: React.MouseEvent) {
        e.preventDefault();
        setFiat(!fiat)
    }

    return (<form className="flex flex-col gap-4">
        <section className="flex flex-col gap-1">
            <h3>Do you want this donation as tax deductable?</h3>
            <div className="flex space-x-4">
                <label>
                    <input
                        type="radio"
                        id="yes"
                        name="deductable"
                        value="yes"
                        onChange={radioHandler}
                        defaultChecked={true}
                    />
                    Yes
                </label>
                <label>
                    <input
                        type="radio"
                        id="no"
                        value="no"
                        name="deductable"
                        onChange={radioHandler}
                    />
                    No
                </label>
            </div>
            <input
                type="text"
                placeholder={`Name (${deductable === "yes" ? "required" : "optional"
                    })`}
                required={deductable === "yes"}
            ></input>
            <input
                type="text"
                placeholder={`Email (${deductable === "yes" ? "required" : "optional"
                    })`}
                required={deductable === "yes"}
            ></input>

        </section>

        <section>
            <div className="flex justify-between items-center">
                <h3>How much would you like to donate?</h3>
                <button className="small" onClick={handleToggleFiat}>Toggle Fiat Mode</button>
            </div>
            <div className="md:flex-row flex flex-col gap-2 py-2" role="group">
                {fiat ? ["50", "100", "250", "500"].map(value =>
                    <button className="group" onClick={(e) => handleFiatAmountClick(e, value)}>${value}</button>
                ) : ["100k", "1m", "5m", "10m"].map(value =>
                    <button className="group" onClick={(e) => handleSatsAmountClick(e, value)}>{value} sats</button>
                )}
                <div className="relative flex w-full">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        {/* <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-black" /> */}
                        <span className="w-5 h-5 font-mono text-xl mb-2">{fiat ? "$" : "₿"}</span>
                    </div>
                    <input type="text" id="amount" value={amount} className="!pl-10 w-full" placeholder="Or enter custom amount" />
                </div>
            </div>




            <div className="h-4 w-4" />
            <button className="w-full" type="submit">Make Donation</button>
        </section>
        {/* <Pay /> */}
    </form >
    )
};

export default DonationSteps;
