import Button from 'components/ui/Button'

interface FormButtonProps {
  label: string
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  className?: string
}

export const FormButton = ({
  label,
  handleSubmit,
  className,
}: FormButtonProps) => {
  return (
    <form onSubmit={handleSubmit} className={className}>
      <Button type='submit' className='w-full'>
        <span className='w-full'>{label}</span>
      </Button>
    </form>
  )
}
