import Button from 'components/Button'
import router from 'next/router'
import CheckSuccessIcon from '../../assets/icons/check_success.svg'

export const SuccessAddJeuneMilo = () => {
  return (
    <div className='flex flex-col items-center p-6 p-12 border border-bleu_blanc rounded-large text-center'>
      <CheckSuccessIcon
        role='img'
        focusable='false'
        aria-label='Compte jeune créé avec succès'
      />
      <div className='mt-12 mb-10'>
        <h2 className='text-base-medium text-bleu_nuit mb-4'>
          Le compte jeune a été créé avec succès.
        </h2>
        <h3 className='text-sm-medium'>
          Vous pouvez désormais le retrouver dans l&apos;onglet mes jeunes
        </h3>
      </div>
      <Button type='button' onClick={() => router.push('/')}>
        Accéder à la fiche du jeune
      </Button>
    </div>
  )
}
