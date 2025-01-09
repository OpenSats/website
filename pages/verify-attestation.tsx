import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import * as ed from '@noble/ed25519'

import { Form, FormControl, FormField, FormItem, FormLabel } from '../components/ui/form'
import { Textarea } from '../components/ui/textarea'
import { useEffect, useMemo, useState } from 'react'
import { env } from '../env.mjs'
import { CheckIcon, XIcon } from 'lucide-react'

const schema = z.object({ message: z.string(), signature: z.string() })

type AttestationInputs = z.infer<typeof schema>

function VerifyDonation() {
  const [signatureIsValid, setSignatureIsValid] = useState(false)

  const form = useForm<AttestationInputs>({
    resolver: zodResolver(schema),
    defaultValues: { message: '', signature: '' },
    mode: 'all',
  })

  const message = form.watch('message')
  const signature = form.watch('signature')

  useEffect(() => {
    ;(async () => {
      if (!(message && signature)) return setSignatureIsValid(false)

      try {
        const isValid = await ed.verifyAsync(
          signature,
          Buffer.from(message, 'utf-8').toString('hex'),
          env.NEXT_PUBLIC_ATTESTATION_PUBLIC_KEY_HEX.toLowerCase()
        )

        return setSignatureIsValid(isValid)
      } catch (error) {
        console.log(error)
        setSignatureIsValid(false)
      }
    })()
  }, [message, signature])

  return (
    <div className="w-full max-w-xl m-auto p-6 flex flex-col space-y-4 bg-white rounded-lg">
      <h1 className="font-bold">Verify Attestation</h1>

      <Form {...form}>
        <form className="flex flex-col space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea className="h-56 font-mono" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signature</FormLabel>
                <FormControl>
                  <Textarea className="h-20 font-mono" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {!!(message && signature) ? (
            signatureIsValid ? (
              <span className="flex flex-row items-center text-sm self-end text-teal-500 font-semibold">
                <CheckIcon className="mr-2" /> Valid signature
              </span>
            ) : (
              <span className="flex flex-row items-center text-sm self-end text-red-500 font-semibold">
                <XIcon className="mr-2" /> Invalid signature
              </span>
            )
          ) : (
            ''
          )}
        </form>
      </Form>
    </div>
  )
}

export default VerifyDonation
