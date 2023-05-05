import Button, { ButtonStyle } from 'components/ui/Button/Button'

interface FormButtonProps {
  label: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  className?: string
  style?: ButtonStyle
}

export const FormButton = ({
  label,
  handleSubmit,
  className,
  style = ButtonStyle.PRIMARY,
}: FormButtonProps) => {
  return (
    <form onSubmit={handleSubmit} className={className}>
      <Button type='submit' className='w-full' style={style}>
        <span className='w-full'>{label}</span>
      </Button>
    </form>
  )
}
