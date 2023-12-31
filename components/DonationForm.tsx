import { useEffect, useRef, useState } from 'react'
import { MAX_AMOUNT } from '../config'
import { fetchPostJSON } from '../utils/api-helpers'
import Spinner from './Spinner'
import * as EmailValidator from 'email-validator'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { config } from '@fortawesome/fontawesome-svg-core'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

type DonationStepsProps = {
  projectNamePretty: string
  btcpay: string
  zaprite: string
}
const DonationSteps: React.FC<DonationStepsProps> = ({
  projectNamePretty,
  btcpay,
  zaprite,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [deductible, setDeductible] = useState('no')
  const [amount, setAmount] = useState('')

  const [readyToPayFiat, setReadyToPayFiat] = useState(false)
  const [readyToPayBTC, setReadyToPayBTC] = useState(false)

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
    let fiatValid = false
    let btcValid: boolean
    if (amount && typeof parseInt(amount) === 'number') {
      fiatValid = true
    }
    if (deductible === 'no' || (name && email)) {
      btcValid = true
    } else {
      fiatValid = false
      btcValid = false
    }
    setReadyToPayFiat(fiatValid)
    setReadyToPayBTC(btcValid)
  }, [deductible, amount, email, name])

  async function handleBtcPay() {
    const validity = formRef.current?.checkValidity()
    if (!validity) {
      return
    }
    setBtcpayLoading(true)
    try {
      const payload = {
        btcpay,
        zaprite,
      }

      if (amount) {
        Object.assign(payload, { amount })
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
        btcpay,
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
        <h3>Do you want this donation to be tax deductible?</h3>
        <div className="flex space-x-4 pb-4">
          <label>
            <input
              type="radio"
              id="yes"
              name="deductible"
              value="yes"
              onChange={radioHandler}
              defaultChecked={false}
              className="mr-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              id="no"
              value="no"
              name="deductible"
              onChange={radioHandler}
              defaultChecked={true}
              className="mr-1 rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            />
            No
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
          placeholder={'Satoshi Nakamoto'}
          required={deductible === 'yes'}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
        ></input>
        <h3>
          Email{' '}
          <span className="text-subtle">
            {deductible === 'yes' ? '(required)' : '(optional)'}
          </span>
        </h3>
        <input
          type="email"
          placeholder={`satoshin@gmx.com`}
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
          required={deductible === 'yes'}
          onChange={(e) => {
            setEmail(e.target.value)
            EmailValidator.validate(e.target.value)
          }}
        ></input>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3>How much would you like to donate?</h3>
        </div>
        <div className="flex flex-col gap-2 py-2 sm:flex-row" role="group">
          {[50, 100, 250, 500].map((value, index) => (
            <button
              key={index}
              className="group"
              onClick={(e) => handleFiatAmountClick(e, value?.toString() ?? '')}
            >
              {value ? `$${value}` : 'Any'}
            </button>
          ))}
          <div className="relative flex w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {/* <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-black" /> */}
              <span className="mb-2 h-5 w-5 font-mono text-xl">{'$'}</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
              }}
              className="mt-1 block w-full w-full rounded-md border-gray-300 !pl-10 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
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
          disabled={!readyToPayBTC || btcPayLoading}
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
          disabled={!readyToPayFiat || fiatLoading}
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
