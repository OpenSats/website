import { faMonero } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'
import { MAX_AMOUNT } from '../config'
import { fetchPostJSON } from '../utils/api-helpers'
import Spinner from './Spinner'

type DonationStepsProps = {
  projectNamePretty: string
  projectSlug: string
}
const DonationSteps: React.FC<DonationStepsProps> = ({
  projectNamePretty,
  projectSlug,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [deductible, setDeductible] = useState('no')
  const [amount, setAmount] = useState('')

  const [readyToPay, setReadyToPay] = useState(false)

  const [btcPayLoading, setBtcpayLoading] = useState(false)
  const [fiatLoading, setFiatLoading] = useState(false)

  const formRef = useRef<HTMLFormElement | null>(null)

  const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeductible(event.target.value)
  }

  function handleFiatAmountClick(e: React.MouseEvent, value: string) {
    e.preventDefault()
    setAmount(value)
  }

  useEffect(() => {
    if (amount && typeof parseInt(amount) === 'number') {
      if (deductible === 'no' || (name && email)) {
        setReadyToPay(true)
      } else {
        setReadyToPay(false)
      }
    } else {
      setReadyToPay(false)
    }
  }, [deductible, amount, email, name])

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
        project_name: projectNamePretty
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
        <h3>Do you want this donation to be tax deductible (USA only)?</h3>
        <div className="flex space-x-4 pb-4">
          <label>
            <input
              type="radio"
              id="no"
              name="deductible"
              value="no"
              onChange={radioHandler}
              defaultChecked={true}
            />
            No
          </label>
          <label>
            <input
              type="radio"
              id="yes"
              value="yes"
              name="deductible"
              onChange={radioHandler}
            />
            Yes
          </label>
        </div>

        <h3>
          Name{' '}
          <span className="text-subtle">
            {deductible === 'yes' ? '(required)' : '(optional)'}
          </span>
        </h3>
        <input
          type="text"
          placeholder={'Nicolas van Saberhagen'}
          required={deductible === 'yes'}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        ></input>
        <h3>
          Email{' '}
          <span className="text-subtle">
            {deductible === 'yes' ? '(required)' : '(optional)'}
          </span>
        </h3>
        <input
          type="email"
          placeholder={`nicolas@cryptonote.org`}
          required={deductible === 'yes'}
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
              icon={faMonero}
              className="text-primary h-8 w-8"
            />
          )}
          <span className="whitespace-nowrap">Donate with Monero or BTC</span>
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
