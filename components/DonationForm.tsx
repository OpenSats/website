import { useEffect, useRef, useState } from 'react'
import { fetchPostJSON } from '../utils/api-helpers'
import Spinner from './Spinner'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { config } from '@fortawesome/fontawesome-svg-core'
import { faBitcoin } from '@fortawesome/free-brands-svg-icons'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import '@fortawesome/fontawesome-svg-core/styles.css'
import convertToBtc from 'utils/convertToBitcoin'
import satsIsGreaterThanZero from 'utils/satsIsGreaterThanZero'

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

  const [deductible, setDeductible] = useState('yes')
  const [amount, setAmount] = useState('')
  const [btcAmount, setBtcAmount] = useState('')

  const [readyToPayFiat, setReadyToPayFiat] = useState(false)
  const [readyToPayBTC, setReadyToPayBTC] = useState(false)

  const [btcPayLoading, setBtcpayLoading] = useState(false)
  const [fiatLoading, setFiatLoading] = useState(false)

  const [denomination, setDenomination] = useState('USD')
  const [presetDonationValues, setPresetDonationsValues] = useState([
    '50',
    '100',
    '250',
    '500',
  ])

  // used to set the value input field if presetValue is chosen
  const satValues = {
    '50k': '50000',
    '100k': '100000',
    '250k': '250000',
    '500k': '500000',
  }

  const formRef = useRef<HTMLFormElement | null>(null)

  const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeductible(event.target.value)
  }

  // toggles between USD and SATS denomination
  function handleDenomination(e: React.MouseEvent, value: string) {
    e.preventDefault()
    if (value === 'USD') {
      setDenomination('SATS')
      setAmount('')
      setPresetDonationsValues([
        '50k',
        '100k',
        '250k',
        '500k',
      ])
    } else {
      setDenomination('USD')
      setAmount('')
      setPresetDonationsValues(['50', '100', '250', '500'])
    }
  }

  // Adds preset amount to input field
  function handleAmountClick(e: React.MouseEvent, value: string) {
    e.preventDefault()
    if (denomination == 'USD') {
      setAmount(value)
    } else {
      const satValue = satValues[value] || ''
      setAmount(satValue)
        
      // Convert sats to btc before adding to btcpayserver payload
      const formatSats = convertToBtc(satValue)
      setBtcAmount(formatSats)
    }
  }

  // Convert SATS to BTC for the onBlur of amount input field
  // Needed in order to pass it to btcpayserver
  function handleSatToBtcConversion(value: string) {
    const convertedAmount = convertToBtc(value)
    setBtcAmount(convertedAmount)
  }

  useEffect(() => {
    let fiatValid = false
    let btcValid: boolean
    const amountChecks = amount && typeof parseInt(amount) === 'number'

    if (
      amountChecks &&
      parseFloat(amount) > 0 &&
      denomination === 'USD' &&
      deductible === 'yes' &&
      name &&
      email
    ) {
      fiatValid = true
      btcValid = true
    } else if (
      amountChecks &&
      denomination === 'USD' &&
      deductible === 'no' &&
      parseFloat(amount) > 0
    ) {
      fiatValid = true
      btcValid = true
    } else if (
      denomination === 'SATS' &&
      deductible === 'no' &&
      satsIsGreaterThanZero(btcAmount)
    ) {
      btcValid = true
    } else {
      fiatValid = false
      btcValid = false
    }

    setReadyToPayFiat(fiatValid)
    setReadyToPayBTC(btcValid)
  }, [deductible, amount, btcAmount, email, name])

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
        ...(denomination === 'USD' ? { amount } : { btcAmount }),
        ...(denomination === 'SATS' ? { currency: 'BTC' } : {}),
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
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
        <h3>Do you want this donation as tax deductible?</h3>
        <div className="flex space-x-4 pb-4">
          <label>
            <input
              type="radio"
              id="yes"
              name="deductible"
              value="yes"
              onChange={radioHandler}
              defaultChecked={true}
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
          onChange={(e) => setEmail(e.target.value)}
        ></input>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3>How much would you like to donate?</h3>
        </div>
        <div className="flex flex-col gap-2 py-2 sm:flex-row" role="group">
          <button
            name="denomination"
            className="group"
            onClick={(e) => handleDenomination(e, denomination)}
          >
            {denomination}
          </button>
          {presetDonationValues.map((value, index) => (
            <button
              key={index}
              className="group"
              onClick={(e) => handleAmountClick(e, value?.toString() ?? '')}
            >
              {value && denomination === 'USD' ? `$${value}` : `${value}`}
            </button>
          ))}
          <div className="relative flex w-full">
            <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center ${denomination === 'USD' ? 'pl-2' : ''}`}>
              <span className="mb-2 h-5 w-5 text-lg text-black pl-2">
                {denomination === 'USD' ? '$' : 'sat'}
              </span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
              }}
              onBlur={(e) => {
                denomination === 'SATS'
                  ? handleSatToBtcConversion(e.target.value)
                  : setAmount(e.target.value)
              }}
              className="mt-1 block w-full w-full rounded-md border-gray-300 !pl-10 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
              placeholder={
                denomination === 'USD'
                  ? 'Enter custom amount'
                  : 'Enter custom amount in sats'
              }
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
          disabled={!readyToPayFiat || fiatLoading || denomination === 'SATS'}
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
