import { modalites } from 'referentiel/rdv'

import Modal from 'components/Modal'
import Button from 'components/Button'
import { useEffect, useState } from 'react'
import { Jeune } from 'interfaces'
import { RdvFormData } from 'interfaces/json/rdv'
import fetchJson from 'utils/fetchJson'

type RdvModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const AddRdvModal = ({ show, onClose, onAdd }: RdvModalProps) => {
  const [jeunes, setJeunes] = useState<Jeune[]>([])

  const [jeune, selectJeune] = useState('')
  const [creneau, selectCreneau] = useState('')
  const [duree, selectDuree] = useState('')
  const [modalite, selectModalite] = useState('')
  const [date, selectDate] = useState('')
  const [notes, selectNotes] = useState('')
  const [conseillerId, setConseillerId] = useState<number | undefined>(
    undefined
  )

  useEffect(() => {
    async function fetchJeunes(): Promise<Jeune[]> {
      const { id } = await fetchJson('/api/user')

      const data = await fetchJson(
        `${process.env.API_ENDPOINT}/conseillers/${id}/login`
      )

      setConseillerId(id)
      return data?.jeunes || []
    }

    fetchJeunes().then((data) => {
      const defaultJeune: Jeune = {
        id: '',
        firstName: '',
        lastName: '',
      }

      setJeunes([defaultJeune, ...data])
    })
  }, [])

  const creneauIsValid = () =>
    creneau !== '' && creneau.match(/[0-9][0-9]:[0-9][0-9]/gm)

  const FormIsValid = () =>
    duree !== '' &&
    creneauIsValid() &&
    modalite !== '' &&
    jeune !== '' &&
    date !== ''

  const handleAddClick = (event: any) => {
    event.preventDefault()
    const rdvDate = new Date(date)
    const hours: number = Number(creneau.substring(0, 2))
    const minutes: number = Number(creneau.substring(3, 5))
    rdvDate.setUTCHours(hours)
    rdvDate.setUTCMinutes(minutes)

    const newRdv: RdvFormData = {
      id: '',
      title: 'titre',
      subtitle: 'sous-titre',
      jeuneId: jeune,
      date: rdvDate.toUTCString(),
      duration: parseInt(duree),
      modality: modalite,
      comment: notes,
    }

    if (!conseillerId) {
      throw new Error("AddRdvModal: L'Id du conseiller est manquant")
    }

    fetch(
      `${process.env.API_ENDPOINT}/conseillers/${conseillerId}/rendezvous`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newRdv),
      }
    ).then(function () {
      onClose()
      onAdd()
    })
  }

  return (
    <Modal title='Créer un nouveau RDV' onClose={() => onClose()} show={show}>
      <form method='POST' role='form' onSubmit={handleAddClick}>
        <div className='flex'>
          <div className='pr-[20px]' style={{ flexBasis: '50%' }}>
            <label
              htmlFor='beneficiaire'
              className='text-sm-semi text-bleu_nuit mb-[20px] block'
            >
              Choisir un bénéficiaire <span aria-hidden='true'>*</span>
            </label>
            <select
              id='beneficiaire'
              name='beneficiaire'
              value={jeune}
              onChange={(e) => selectJeune(e.target.value)}
              required
              className='text-sm text-bleu_nuit w-full p-[12px] mb-[20px] cursor-pointer border border-bleu_nuit rounded-medium'
            >
              {jeunes.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.firstName} {j.lastName}
                </option>
              ))}
            </select>

            <label
              htmlFor='date'
              className='text-sm-semi text-bleu_nuit mb-[20px] block'
            >
              Choisir une date <span aria-hidden='true'>*</span>
            </label>
            <input
              type='date'
              id='date'
              name='rdv-date'
              value={date}
              onChange={(e) => selectDate(e.target.value)}
              required
              className='text-md text-bleu_nuit w-full p-[7px] mb-[20px] border border-bleu_nuit rounded-medium'
            />
          </div>

          <div className='pl-[20px]' style={{ flexBasis: '50%' }}>
            <label
              htmlFor='creneaux'
              className='text-sm-semi text-bleu_nuit mb-[20px] block'
            >
              Heure du rendez-vous (hh:mm) <span aria-hidden='true'>*</span>
            </label>
            <input
              type='text'
              id='creneau'
              name='creneau'
              value={creneau}
              placeholder='par exemple: 15:00'
              onChange={(e) => selectCreneau(e.target.value)}
              required
              className='text-md text-bleu_nuit w-full p-[12px] mb-[20px] placeholder-bleu_nuit placeholder-opacity-50 border border-bleu_nuit rounded-medium'
            />

            <label
              htmlFor='duree'
              className='text-sm-semi text-bleu_nuit mb-[20px] block'
            >
              Durée du RDV (en minutes) <span aria-hidden='true'>*</span>
            </label>
            <input
              type='number'
              id='duree'
              name='duree'
              value={duree}
              placeholder='Saisir la durée en minutes'
              onChange={(e) => selectDuree(e.target.value)}
              required
              className='text-md text-bleu_nuit w-full p-[12px] mb-[20px] placeholder-bleu_nuit placeholder-opacity-50 border border-bleu_nuit rounded-medium'
            />

            <label
              htmlFor='modalite'
              className='text-sm-semi text-bleu_nuit mb-[20px] block'
            >
              Modalité de contact <span aria-hidden='true'>*</span>
            </label>
            <select
              id='modalite'
              name='modalite'
              value={modalite}
              onChange={(e) => selectModalite(e.target.value)}
              required
              className='text-sm text-bleu_nuit w-full p-[12px] mb-[20px] cursor-pointer border border-bleu_nuit rounded-medium'
            >
              {modalites.map((md) => (
                <option key={md} value={md}>
                  {md}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          htmlFor='notes'
          className='text-sm-semi text-bleu_nuit mb-[20px] block'
        >
          Notes
        </label>
        <textarea
          id='notes'
          name='notes'
          value={notes}
          onChange={(e) => selectNotes(e.target.value)}
          className='text-md text-bleu_nuit w-full min-h-[60px] p-[10px] mb-[10px] placeholder-bleu_nuit placeholder-opacity-50 resize-none border border-bleu_nuit rounded-medium'
          placeholder='Écrire ici...'
        />

        <span className='text-xs text-bleu_nuit mb-[10px]' aria-hidden='true'>
          * : champs obligatoires
        </span>

        <Button type='submit' disabled={!FormIsValid()} className='m-auto'>
          <span className='px-[48px] py-[11px]'>INVITER</span>
        </Button>
      </form>
    </Modal>
  )
}

export default AddRdvModal
