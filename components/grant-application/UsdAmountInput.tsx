import { useState } from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { formatUsd, parseUsd } from '@/utils/usd'
import FieldError from './FieldError'
import { FormValues, inputClass } from './types'

interface UsdAmountInputProps {
  name: string
  label: string
  hint?: string
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
  defaultAmount?: unknown
}

export default function UsdAmountInput({
  name,
  label,
  hint,
  register,
  errors,
  defaultAmount,
}: UsdAmountInputProps) {
  const initial = parseUsd(defaultAmount)
  const [text, setText] = useState(
    initial === undefined ? '' : formatUsd(initial)
  )
  const registration = register(name, {
    required: 'Enter a dollar amount',
    setValueAs: parseUsd,
    validate: (value) =>
      (typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
      'Enter a dollar amount',
  })

  return (
    <label className="block">
      {label}
      {hint ? (
        <>
          <br />
          <small>{hint}</small>
        </>
      ) : null}
      <div className="relative mt-1 max-w-xs">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-black">
          $
        </span>
        <input
          {...registration}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`${inputClass} mt-0 pl-8`}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            void registration.onChange(event)
          }}
          onBlur={(event) => {
            const amount = parseUsd(event.target.value)
            setText(amount === undefined ? '' : formatUsd(amount))
            void registration.onBlur(event)
          }}
        />
      </div>
      <FieldError errors={errors} name={name} />
    </label>
  )
}
