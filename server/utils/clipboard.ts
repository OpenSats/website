import { toast } from '../../components/ui/use-toast'

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)

  toast({
    title: 'Success',
    description: 'Copied to clipboard!',
  })
}
