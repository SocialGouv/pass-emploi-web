import React from 'react'

import FailureIcon from 'assets/icons/informations/info.svg'

export type LigneErreur = {
  ancre: string
  label: string
  titreChamp: string
}

type ErreursFormulaireProps = {
  erreurs: LigneErreur[]
}

export default function RecapitulatifErreursFormulaire({
  erreurs,
}: ErreursFormulaireProps) {
  if (!erreurs.length) return null

  return (
    <div
      role='alert'
      className='text-warning bg-warning_lighten p-6 rounded-base mb-8'
      id='recapitulatif-erreurs-formulaire'
    >
      <div className='flex items-center mb-8'>
        <FailureIcon
          aria-hidden={true}
          focusable={false}
          className='w-6 h-6 mr-2 fill-warning shrink-0'
        />
        <p className='text-base-bold grow'>{`Le formulaire contient ${erreurs.length} erreur(s).`}</p>
      </div>
      {erreurs.map(({ label, ancre, titreChamp }) => {
        return (
          <p key={titreChamp} className='mb-2'>
            {label}{' '}
            <a href={ancre} className='underline'>
              Remplir <span className='sr-only'>le champ {titreChamp} </span>
              <span aria-hidden={true}>&gt;</span>
            </a>
          </p>
        )
      })}
    </div>
  )
}
