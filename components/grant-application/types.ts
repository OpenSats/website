import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form'

export type FormValues = { [key: string]: unknown }

export interface StepProps {
  register: UseFormRegister<FormValues>
  watch: UseFormWatch<FormValues>
  errors: FieldErrors<FormValues>
}

export const inputClass =
  'mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'

export const checkboxClass =
  'rounded-md border-gray-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50'
