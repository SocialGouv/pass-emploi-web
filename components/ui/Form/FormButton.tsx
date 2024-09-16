import Button, { ButtonStyle } from 'components/ui/Button/Button'

interface FormButtonProps {
  label: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  className?: string
  style?: ButtonStyle
}

export default function FormButton({
  label,
  handleSubmit,
  className,
  style = ButtonStyle.PRIMARY,
}: FormButtonProps) {
  return (
    <form onSubmit={handleSubmit} className={className}>
      <Button type='submit' className='w-full' style={style}>
        {label}
      </Button>
    </form>
  )
}
