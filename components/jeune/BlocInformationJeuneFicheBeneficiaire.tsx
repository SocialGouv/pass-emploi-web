import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useRef, useState } from 'react'

// FIXME should use dynamic(() => import() but issue with jest
import ChangementDispositifBeneficiaireModal from 'components/ChangementDispositifBeneficiaireModal'
import {
  Email,
  IdentifiantPartenaire,
  InformationNonDisponible,
} from 'components/jeune/BlocInformationJeune'
import DispositifTag from 'components/jeune/DispositifTag'
import SituationTag from 'components/jeune/SituationTag'
import { ModalHandles } from 'components/Modal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { CategorieSituation, DetailBeneficiaire } from 'interfaces/beneficiaire'
import {
  Conseiller,
  estConseilDepartemental,
  estMilo,
} from 'interfaces/conseiller'
import { toShortDate } from 'utils/date'

interface BlocInformationJeuneFicheBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  conseiller: Conseiller
  urlDossier?: string
  onIdentifiantPartenaireCopie?: () => void
  identifiantPartenaire?: string
  onIdentifiantPartenaireClick?: () => void
}

export default function BlocInformationJeuneFicheBeneficiaire({
  beneficiaire,
  conseiller,
  onIdentifiantPartenaireCopie,
  identifiantPartenaire,
  onIdentifiantPartenaireClick,
}: BlocInformationJeuneFicheBeneficiaireProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'
  const conseillerEstMilo = estMilo(conseiller)
  const aIdentifiantFT =
    !conseillerEstMilo && !estConseilDepartemental(conseiller)
  const { situations, dateFinCEJ, email, id, dispositif } = beneficiaire

  const [dispositifActuel, setDispositifActuel] = useState<string>(dispositif)
  const [afficherChangementDispositif, setAfficherChangementDispositif] =
    useState<boolean>(false)
  const modalRef = useRef<ModalHandles>(null)

  async function changerDispositif(nouveauDispositif: string): Promise<void> {
    const { modifierDispositif } = await import(
      'services/beneficiaires.service'
    )
    await modifierDispositif(beneficiaire.id, nouveauDispositif)
    setDispositifActuel(nouveauDispositif)
    modalRef.current!.closeModal()
  }

  return (
    <>
      <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
        <h2 className='text-m-bold text-grey_800 mb-2'>Informations</h2>
        <dl className='mb-2'>
          {conseillerEstMilo && (
            <div className='flex gap-2 mb-4'>
              <dt className='sr-only'>Dispositif</dt>
              <dd>
                <DispositifTag dispositif={dispositifActuel} />
              </dd>

              <dt className='sr-only'>Situation</dt>
              <dd>
                {!situations?.length && (
                  <SituationTag situation={CategorieSituation.SANS_SITUATION} />
                )}

                {Boolean(situations?.length) && (
                  <SituationTag situation={situations[0].categorie} />
                )}
              </dd>
            </div>
          )}

          {conseillerEstMilo && (
            <div className='flex'>
              <dt className='text-base-regular'>Date de fin du CEJ :</dt>
              <dd className='text-base-bold ml-1'>
                {dateFinCEJ ? (
                  toShortDate(dateFinCEJ)
                ) : (
                  <InformationNonDisponible />
                )}
              </dd>
            </div>
          )}

          {email && <Email email={email} />}

          {aIdentifiantFT &&
            onIdentifiantPartenaireCopie &&
            onIdentifiantPartenaireClick && (
              <IdentifiantPartenaire
                identifiantPartenaire={identifiantPartenaire}
                onCopy={onIdentifiantPartenaireCopie}
                onClick={onIdentifiantPartenaireClick}
              />
            )}
        </dl>

        <BoutonChangementDispositif
          onClick={() => setAfficherChangementDispositif(true)}
        />
        <LienVersInformations idBeneficiaire={id} pathPrefix={pathPrefix} />
      </div>

      {afficherChangementDispositif && (
        <ChangementDispositifBeneficiaireModal
          ref={modalRef}
          dispositif={dispositifActuel}
          onConfirm={changerDispositif}
          onCancel={() => setAfficherChangementDispositif(false)}
        />
      )}
    </>
  )
}

function BoutonChangementDispositif({ onClick }: { onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'
    >
      Changer le bénéficiaire de dispositif
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </button>
  )
}

function LienVersInformations({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire: string
  pathPrefix: string
}) {
  return (
    <Link
      href={`${pathPrefix}/${idBeneficiaire}/informations?onglet=informations`}
      className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'
    >
      Voir plus d’informations
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}
