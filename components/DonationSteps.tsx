import { useState } from "react";
import Pay from "./Pay";

const DonationSteps = () => {
  const [step, setStep] = useState(1);

  // STEP 1
  const [deductable, setDeductable] = useState("yes");

  const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeductable(event.target.value);
  };

  function handleStep1() {
    setStep(2);
  }

  // STEP 2
  function handleStep2() {
    setStep(3);
  }

  // STEP 3

  switch (step) {
    case 1:
      return (
        <section>
          <form className="flex flex-col space-y-2" onSubmit={handleStep1}>
            <h2>Do you want this donation as tax deductable?</h2>
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
              placeholder={`Email address (${
                deductable === "yes" ? "required" : "optional"
              })`}
              required={deductable === "yes"}
            ></input>
            <div className="h-4 w-4" />
            <div className="justify-end flex space-x-4">
              <button type="submit">Continue</button>
            </div>
          </form>
        </section>
      );
    case 2:
      return (
        <section>
          <form className="flex flex-col space-y-2" onSubmit={handleStep2}>
            <h2>One-time donation amount</h2>
            <input
              type="number"
              placeholder={`0.00`}
              required={deductable === "yes"}
            ></input>
            <div className="h-4 w-4" />
            <div className="justify-end flex space-x-4">
              <button className="secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit">Donate</button>
            </div>
          </form>
        </section>
      );
    case 3:
      return <Pay />;
    // never forget the default case, otherwise VS code would be mad!
    default:
      return <p>DEFAULT</p>;
  }
};

export default DonationSteps;
