import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'
import { MAX_AMOUNT } from '../config'
import { fetchPostJSON } from '../utils/api-helpers'
import Spinner from './Spinner'

type DonationStepsProps = {
  projectNamePretty: string
  projectSlug: string
  zaprite: string
}
const DonationSteps: React.FC<DonationStepsProps> = ({
  projectNamePretty,
  projectSlug,
  zaprite,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [deductable, setDeductable] = useState('yes')
  const [amount, setAmount] = useState('')

  const [readyToPay, setReadyToPay] = useState(false)

  const [btcPayLoading, setBtcpayLoading] = useState(false)
  const [fiatLoading, setFiatLoading] = useState(false)

  const [tooMuch, setTooMuch] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null)

  const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeductable(event.target.value)
  }

  function handleFiatAmountClick(e: React.MouseEvent, value: string) {
    e.preventDefault()
    setAmount(value)
  }

  useEffect(() => {
    if (amount && typeof parseInt(amount) === 'number') {
      if (parseInt(amount) > MAX_AMOUNT && deductable === 'yes') {
        setTooMuch(true)
        setReadyToPay(false)
        return
      } else {
        setTooMuch(false)
      }
      if (deductable === 'no' || (name && email)) {
        setReadyToPay(true)
      } else {
        setReadyToPay(false)
      }

    } else {
      setReadyToPay(false)
    }
  }, [deductable, amount, email, name])

  async function handleBtcPay() {
    const validity = formRef.current?.checkValidity()
    if (!validity) {
      return
    }
    setBtcpayLoading(true)
    try {
      const payload = {
        amount,
        project_slug: projectSlug,
        project_name: projectNamePretty,
        zaprite
      }

      if (email) {
        Object.assign(payload, { email })
      }

      if (name) {
        Object.assign(payload, { name })
      }

      console.log(payload)
      const data = await fetchPostJSON('/api/btcpay', payload)
      if (data.checkoutLink) {
        window.location.assign(data.checkoutLink)
      } else if (data.message) {
        throw new Error(data.message)
      } else {
        console.log({ data })
        throw new Error('Something went wrong with BtcPay Server checkout.')
      }
    } catch (e) {
      console.error(e)
    }
    setBtcpayLoading(false)
  }

  async function handleFiat() {
    const validity = formRef.current?.checkValidity()
    if (!validity) {
      return
    }
    setFiatLoading(true)
    try {
      const data = await fetchPostJSON('/api/stripe_checkout', {
        amount,
        project_slug: projectSlug,
        project_name: projectNamePretty,
        zaprite,
        email,
        name,
      })
      console.log({ data })
      if (data.url) {
        window.location.assign(data.url)
      } else {
        throw new Error('Something went wrong with Stripe checkout.')
      }
    } catch (e) {
      console.error(e)
    }
    setFiatLoading(false)
  }

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
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

        <h3>
          Name{' '}
          <span className="text-subtle">
            {deductable === 'yes' ? '(required)' : '(optional)'}
          </span>
        </h3>
        <input
          type="text"
          placeholder={'Satoshi Nakamoto'}
          required={deductable === 'yes'}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        ></input>
        <h3>
          Email{' '}
          <span className="text-subtle">
            {deductable === 'yes' ? '(required)' : '(optional)'}
          </span>
        </h3>
        <input
          type="email"
          placeholder={`satoshin@gmx.com`}
          required={deductable === 'yes'}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
      </section>

      <section>
        <div className="flex justify-between items-center">
          <h3>How much would you like to donate?</h3>
        </div>
        <div className="sm:flex-row flex flex-col gap-2 py-2" role="group">
          {[50, 100, 250, 500].map((value, index) => (
            <button
              key={index}
              className="group"
              onClick={(e) => handleFiatAmountClick(e, value.toString())}
            >
              ${value}
            </button>
          ))}
          <div className="relative flex w-full">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              {/* <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-black" /> */}
              <span className="w-5 h-5 font-mono text-xl mb-2">{'$'}</span>
            </div>
            <input
              required
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
              }}
              className="!pl-10 w-full"
              placeholder="Or enter custom amount"
            />
          </div>


        </div>
        <div>
          {tooMuch && <h3>Donations over $5,000 are not tax deductable</h3>}
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-4">
        <button
          name="btcpay"
          onClick={handleBtcPay}
          className="pay"
          disabled={!readyToPay || btcPayLoading}
        >
          {btcPayLoading ? (
            <Spinner />
          ) : (
            <FontAwesomeIcon
              icon={faBitcoin}
              className="text-primary h-8 w-8"
            />
          )}
          <span className="whitespace-nowrap">Donate with Bitcoin</span>
        </button>
        <button
          name="stripe"
          onClick={handleFiat}
          className="pay"
          disabled={!readyToPay || fiatLoading}
        >
          {fiatLoading ? (
            <Spinner />
          ) : (
            <FontAwesomeIcon
              icon={faCreditCard}
              className="text-primary h-8 w-8"
            />
          )}
          <span className="whitespace-nowrap">Donate with fiat</span>
        </button>
      </div>
    </form>
  )
}

export default DonationSteps
