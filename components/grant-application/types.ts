import {
  UseFormRegister,
  UseFormWatch,
  FieldErrors,
} from 'react-hook-form'

export type FormValues = { [key: string]: unknown }

export interface StepProps {
  register: UseFormRegister<FormValues>
  watch: UseFormWatch<FormValues>
  errors: FieldErrors<FormValues>
}
