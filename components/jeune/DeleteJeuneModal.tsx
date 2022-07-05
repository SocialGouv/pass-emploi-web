import { ChangeEvent, FormEvent, useState } from 'react'

import InformationMessage from 'components/InformationMessage'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DetailJeune } from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
//todo: exporter
export enum TypesMotifsSuppression {
  SORTIE_POSITIVE_DU_CEJ = 'Sortie positive du CEJ',
  RADIATION_DU_CEJ = 'Radiation du CEJ',
  RECREATION_D_UN_COMPTE_JEUNE = "Recréation d'un compte jeune",
  AUTRE = 'Autre',
}

export type MotifsSuppression = TypesMotifsSuppression[]

interface DeleteJeuneModalProps {
  jeune: DetailJeune
  motifs: MotifsSuppression[]
  onClose: () => void
  submitDelete?: () => Promise<void>
}

export default function DeleteJeuneModal({
  jeune,
  motifs,
  onClose,
}: DeleteJeuneModalProps) {
  const [showModalEtape1, setShowModalEtape1] = useState<boolean>(true)
  const [showModalEtape2, setShowModalEtape2] = useState<boolean>(false)

  const [motifSuppressionJeune, setMotifSuppressionJeune] = useState<string>('')
  const [commentaireMotif, setCommentaireMotif] = useState<string>('')
  const [showCommentaireMotif, setShowCommentaireMotif] =
    useState<boolean>(false)

  function openModal2() {
    setShowModalEtape1(false)
    setShowModalEtape2(true)
  }

  function handleSelectedMotifSuppressionJeune(
    e: ChangeEvent<HTMLSelectElement>
  ) {
    setMotifSuppressionJeune(e.target.value)
    setShowCommentaireMotif(e.target.value === TypesMotifsSuppression.AUTRE)
  }

  // function handleSoumettreSuppression(e: FormEvent) {
  //   e.preventDefault()
  //
  //   const payload: SuppressionJeuneFormData = {
  //     motif: motifSuppressionJeune,
  //   }
  // }

  function handleCloseModal() {
    onClose()
  }

  return (
    <>
      {showModalEtape1 && (
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

      {showModalEtape2 && (
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

          <form>
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
              {motifs?.map((motif) => (
                <option value={motif}>{motif}</option>
              ))}
            </select>

            {showCommentaireMotif && (
              <>
                <label htmlFor='motifSuppression-autre'>
                  Veuillez préciser le motif de la suppression du compte
                </label>
                <textarea
                  id='motifSuppression-autre'
                  name='motifSuppression-autre'
                  defaultValue={commentaireMotif}
                  rows={3}
                  onChange={(e) => setCommentaireMotif(e.target.value)}
                  className='border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8'
                />
              </>
            )}
          </form>
          <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
            Annuler
          </Button>
          <Button type='submit' style={ButtonStyle.PRIMARY}>
            Confirmer
          </Button>
        </Modal>
      )}
    </>
  )
}
