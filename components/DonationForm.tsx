import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { faDollar, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Pay from "./Pay";

const DonationSteps = () => {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    const [deductable, setDeductable] = useState("yes");
    const [amount, setAmount] = useState("")

    const [readyToPay, setReadyToPay] = useState(false);

    const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeductable(event.target.value);
    };

    function handleFiatAmountClick(e: React.MouseEvent, value: string) {
        e.preventDefault();
        setAmount(value)
    }

    function handleSubmit(e: React.FormEvent<unknown>) {
        e.preventDefault();
        console.log(amount)
        if (amount) {
            setReadyToPay(true)
        }
    }

    if (readyToPay) {
        return <Pay amount={parseInt(amount)} />
    } else {
        return (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <section className="flex flex-col gap-1">
                    <h3>Do you want this donation as tax deductable?</h3>
                    <div className="flex space-x-4 pb-4">
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

                    <h3>Name <span className="text-subtle">{deductable === "yes" ? "(required)" : "(optional)"}</span></h3>
                    <input
                        type="text"
                        placeholder={"Satoshi Nakamoto"}
                        required={deductable === "yes"}
                        onChange={(e) => setName(e.target.value)}
                        className="mb-4"
                    ></input>
                    <h3>Email <span className="text-subtle">{deductable === "yes" ? "(required)" : "(optional)"}</span></h3>
                    <input
                        type="text"
                        placeholder={`satoshin@gmx.com`}
                        required={deductable === "yes"}
                        onChange={(e) => setEmail(e.target.value)}
                    ></input>

                </section>

                <section>
                    <div className="flex justify-between items-center">
                        <h3>How much would you like to donate?</h3>
                    </div>
                    <div className="sm:flex-row flex flex-col gap-2 py-2" role="group">
                        {["50", "100", "250", "500"].map(value =>
                            <button className="group" onClick={(e) => handleFiatAmountClick(e, value)}>${value}</button>
                        )}
                        <div className="relative flex w-full">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                {/* <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-black" /> */}
                                <span className="w-5 h-5 font-mono text-xl mb-2">{"$"}</span>
                            </div>
                            <input type="text" id="amount" value={amount} className="!pl-10 w-full" placeholder="Or enter custom amount" />
                        </div>
                    </div>
                </section>
                <button className="w-full" type="submit">Make Donation</button>

            </form >

        )
    }

};

export default DonationSteps;
