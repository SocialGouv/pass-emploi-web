import Button from 'components/Button'
import SuccessAddJeuneModal from 'components/jeune/SuccessAddJeuneModal'
import Modal from 'components/Modal'
import { Jeune } from 'interfaces'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type AddJeuneModalProps = {
  show: boolean
  onClose: () => void
}

const AddJeuneModal = ({ show, onClose }: AddJeuneModalProps) => {
  const { data: session } = useSession()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [newJeune, setNewJeune] = useState<Jeune | null>(null)

  const FormIsValid = () => firstName !== '' && lastName !== ''

  const handleCloseModal = () => {
    setNewJeune(null)
    onClose()
  }

  const handleAddClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newJeune = {
      firstName: firstName,
      lastName: lastName,
    }

    fetch(`${process.env.API_ENDPOINT}/conseillers/${session?.user.id}/jeune`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newJeune),
    })
      .then(async function (response) {
        const jeune = await response.json()
        setNewJeune(jeune)
      })
      .catch(function (error) {
        console.error('AddJeuneModal:', error)
      })
      .finally(function () {
        setLastName('')
        setFirstName('')
      })
  }

  return (
    <>
      {!newJeune && (
        <Modal
          title='Ajouter un jeune'
          onClose={handleCloseModal}
          show={show}
          customHeight='450px'
          customWidth='900px'
        >
          <form
            method='POST'
            role='form'
            className='flex flex-col items-center'
            onSubmit={handleAddClick}
          >
            <fieldset>
              <label
                htmlFor='date'
                className='text-lg text-bleu_nuit mb-[20px] block'
              >
                Nom <span aria-hidden='true'>*</span>
              </label>
              <input
                type='lastname'
                id='lastname'
                name='jeune-lastname'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder='Nom du jeune'
                required
                className='text-sm text-bleu_nuit w-[360px] p-[16px] mb-[20px] bg-bleu_blanc rounded-medium'
              />

              <label
                htmlFor='firstname'
                className='text-lg text-bleu_nuit mb-[20px] block'
              >
                Prénom <span aria-hidden='true'>*</span>
              </label>
              <input
                type='firstname'
                id='firstname'
                name='jeune-firstname'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder='Prénom du jeune'
                required
                className='text-sm text-bleu_nuit w-[360px] p-[16px] mb-[20px] bg-bleu_blanc rounded-medium'
              />
            </fieldset>

            <span
              className='text-xs text-bleu_nuit mb-[10px]'
              aria-hidden='true'
            >
              * : champs obligatoires
            </span>

            <Button type='submit' disabled={!FormIsValid()} className='m-auto'>
              <span className='px-[48px] py-[11px]'>Enregistrer le jeune</span>
            </Button>
          </form>
        </Modal>
      )}

      {newJeune && (
        <SuccessAddJeuneModal
          show={newJeune && show}
          onClose={handleCloseModal}
          jeune={newJeune}
        />
      )}
    </>
  )
}

export default AddJeuneModal
