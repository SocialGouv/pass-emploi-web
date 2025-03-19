import React, { ForwardedRef, forwardRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export type LigneErreur = {
  ancre: string
  label: string
  titreChamp: string
}

type ErreursFormulaireProps = {
  erreurs: LigneErreur[]
}

function RecapitulatifErreursFormulaire(
  { erreurs }: ErreursFormulaireProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={
        erreurs.length
          ? 'text-warning bg-warning-lighten p-6 rounded-base mb-8'
          : ''
      }
      tabIndex={-1}
    >
      {erreurs.length > 0 && (
        <>
          <div className='flex items-center mb-4'>
            <IconComponent
              name={IconName.Info}
              aria-hidden={true}
              focusable={false}
              className='w-6 h-6 mr-2 fill-warning shrink-0'
            />
            <p className='text-base-bold grow'>{`Le formulaire contient ${erreurs.length} erreur(s).`}</p>
          </div>
          <ul className='list-disc ml-6'>
            {erreurs.map(({ label, ancre, titreChamp }) => {
              return (
                <li key={titreChamp} className='mb-2'>
                  {label}{' '}
                  <a href={ancre} className='underline'>
                    Remplir{' '}
                    <span className='sr-only'>le champ {titreChamp} </span>
                    <span aria-hidden={true}>&gt;</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default forwardRef(RecapitulatifErreursFormulaire)
