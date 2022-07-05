import { ChangeEvent, FormEvent, useState } from 'react'

import InformationMessage from 'components/InformationMessage'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DetailJeune } from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'

interface DeleteJeuneModalProps {
  jeune: DetailJeune
  onClose: () => void
}

export default function DeleteJeuneModal({
  jeune,
  onClose,
}: DeleteJeuneModalProps) {
  const [showModal1, setShowModal1] = useState<boolean>(true)
  const [showModal2, setShowModal2] = useState<boolean>(false)

  function openModal2() {
    setShowModal1(false)
    setShowModal2(true)
  }

  // function handleSelectedMotifSuppressionJeune(
  //   e: ChangeEvent<HTMLSelectElement>
  // ) {
  //   setMotifSuppressionJeune(e.target.value)
  // }

  // function handleSoumettreSuppression(e: FormEvent) {
  //   e.preventDefault()

  //   const payload: SuppressionJeuneFormData = {
  //     motif: motifSuppressionJeune,
  //   }
  // }

  function handleCloseModal() {
    onClose()
  }

  return (
    <>
      {showModal1 && (
        <Modal
          title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
          onClose={handleCloseModal}
        >
          <IconComponent
            name={IconName.Warning}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 fill-primary'
          />
          <p>
            Le bénéficiaire sera prévenu de la suppression de son compte et sa
            possibilité de demander un accès à ses données pour une période de 2
            ans avant qu’elles soient supprimées.
          </p>
          <p>Souhaitez-vous continuer la suppression ?</p>
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            onClick={handleCloseModal}
          >
            Annuler
          </Button>
          <Button
            type='button'
            style={ButtonStyle.PRIMARY}
            onClick={openModal2}
          >
            Continuer
          </Button>
        </Modal>
      )}

      {showModal2 && (
        <Modal
          title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
          onClose={handleCloseModal}
        >
          <IconComponent
            name={IconName.Warning}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 fill-primary'
          />
          <InformationMessage content='Une fois confirmé toutes les informations liées à ce compte jeune seront supprimées' />

          {/* <form onSubmit={handleSoumettreSuppression}>
            <label htmlFor='motifSuppression'>Motif de suppression</label>
            <select
              id='motifSuppression'
              name='motifSuppression'
              defaultValue={motifSuppressionJeune}
              required={true}
              onChange={handleSelectedMotifSuppressionJeune}
              className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
            >
              <option aria-hidden hidden disabled value={''} />
              {['motfi', 'Autre'].map((motif) => (
                <option key={motif} value={motif}>
                  {motif}
                </option>
              ))}
            </select>
          </form> */}
          <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
            Annuler
          </Button>
          <Button type='button' style={ButtonStyle.PRIMARY}>
            Confirmer
          </Button>
        </Modal>
      )}
    </>
  )
}
