import { CopyIcon } from 'lucide-react'

import { Button } from './ui/button'
import { DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'

type AttestationModalContentProps = {
  message?: string
  signature?: string
  closeModal: () => void
}

function AttestationModalContent({ message, signature, closeModal }: AttestationModalContentProps) {
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)

    toast({
      title: 'Success',
      description: 'Copied to clipboard!',
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Attestation</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>Message</Label>
          <Textarea className="h-56 font-mono" readOnly value={message} />
          <Button
            size="sm"
            variant="light"
            className="ml-auto"
            onClick={() => copyToClipboard(message!)}
          >
            <CopyIcon size={20} /> Copy
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Signature</Label>
          <Textarea className="h-20 font-mono" readOnly value={signature} />
          <Button
            size="sm"
            variant="light"
            className="ml-auto"
            onClick={() => copyToClipboard(signature!)}
          >
            <CopyIcon size={20} /> Copy
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default AttestationModalContent
