import Link from 'next/link'
import React from 'react'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { CategorieSituation, EtatSituation } from 'interfaces/jeune'

interface BlocSituationProps {
  idJeune: string
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  versionResumee: boolean
}

export function BlocSituation({
  idJeune,
  situations,
  versionResumee,
}: BlocSituationProps) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      {versionResumee && <h2 className='text-m-bold mb-1'>Situation</h2>}
      {!(situations && situations.length) && <SansSituation />}

      {situations && Boolean(situations.length) && (
        <ol className='flex flex-row flex-wrap'>
          {situations
            .slice(0, versionResumee ? 1 : situations.length)
            .map((situation) => (
              <Situation
                key={situation.etat + '-' + situation.categorie}
                categorie={situation.categorie}
                etat={situation.etat}
                dateFin={situation.dateFin}
              />
            ))}
        </ol>
      )}

      {versionResumee && <LienVersHistorique idJeune={idJeune} />}
    </div>
  )
}

function SansSituation() {
  return (
    <ol>
      <li className='mt-3'>
        <div className='mb-3'>
          <SituationTag situation={CategorieSituation.SANS_SITUATION} />
        </div>
        <div className='mb-3'>
          Etat : <span className='text-base-medium'>--</span>
        </div>
        <div>
          Fin le : <span className='text-base-medium'>--</span>
        </div>
      </li>
    </ol>
  )
}

function Situation({
  categorie,
  dateFin,
  etat,
}: {
  categorie: CategorieSituation
  etat?: EtatSituation
  dateFin?: string
}) {
  return (
    <li className='mt-3 mr-32 last:mr-0'>
      <div className='mb-3'>
        <SituationTag situation={categorie} />
      </div>
      <div className='mb-3'>
        Etat : <span className='text-base-medium'>{etat ?? '--'}</span>
      </div>
      <div className=''>
        Fin le : <span className='text-base-medium'>{dateFin ?? '--'}</span>
      </div>
    </li>
  )
}

function LienVersHistorique({ idJeune }: { idJeune: string }) {
  return (
    <Link
      href={`/mes-jeunes/${idJeune}/historique`}
      className='flex items-center text-content_color underline hover:text-primary hover:fill-primary mt-3'
    >
      Voir le détail des situations
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}
