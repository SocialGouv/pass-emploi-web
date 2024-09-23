import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import {
  EntreesAgendaParJourDeLaSemaine,
  SemaineAgenda,
} from 'components/agenda-jeune/EntreesAgendaParJourDeLaSemaine'
import { IntegrationFranceTravail } from 'components/jeune/IntegrationFranceTravail'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import { Agenda, EntreeAgenda } from 'interfaces/agenda'
import { estFranceTravail } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toMonthday } from 'utils/date'

interface OngletAgendaBeneficiaireProps {
  idBeneficiaire: string
  recupererAgenda: () => Promise<Agenda>
  goToActions: () => void
}

export default function OngletAgendaBeneficiaire({
  idBeneficiaire,
  recupererAgenda,
  goToActions,
}: OngletAgendaBeneficiaireProps) {
  const [conseiller] = useConseiller()

  const [semaines, setSemaines] = useState<{
    courante: SemaineAgenda
    suivante: SemaineAgenda
  }>()
  const [nombreActionsEnRetard, setNombreActionsEnRetard] = useState<number>()

  useEffect(() => {
    if (!estFranceTravail(conseiller)) {
      recupererAgenda().then(
        ({
          entrees,
          metadata: { dateDeDebut, dateDeFin, actionsEnRetard },
        }) => {
          const { courante, suivante, separation } = preparerSemaines(
            dateDeDebut,
            dateDeFin
          )

          entrees.forEach((entree) => {
            const semaine = entree.date < separation ? courante : suivante
            const jour = semaine.jours[toMonthday(entree.date)]
            if (!jour) return
            jour.entrees.push(entree)
            semaine.aEvenement = true
          })

          setSemaines({ courante, suivante })
          setNombreActionsEnRetard(actionsEnRetard)
        }
      )
    }
  }, [])

  return (
    <>
      {estFranceTravail(conseiller) && (
        <IntegrationFranceTravail label='convocations et démarches' />
      )}

      {!estFranceTravail(conseiller) && (
        <>
          {!semaines && <SpinningLoader alert={true} />}

          {semaines && (
            <>
              {Boolean(nombreActionsEnRetard) && (
                <div className='flex justify-between p-4 mb-6 bg-warning_lighten rounded-base'>
                  <div className='flex gap-2'>
                    <IconComponent
                      name={IconName.Error}
                      focusable={false}
                      aria-hidden={true}
                      className='w-[16px] h-[16px] m-auto fill-warning'
                    />
                    <p>Actions en retard ({nombreActionsEnRetard})</p>
                  </div>
                  <button
                    type='button'
                    onClick={goToActions}
                    className='flex items-center'
                  >
                    Voir
                    <IconComponent
                      name={IconName.ChevronRight}
                      className='w-4 h-5'
                      aria-hidden={true}
                      focusable={false}
                    />
                    <span className='sr-only'>les actions</span>
                  </button>
                </div>
              )}
              <section aria-labelledby='semaine-en-cours'>
                <h2
                  id='semaine-en-cours'
                  className='text-m-bold text-primary mb-6'
                >
                  Semaine en cours
                </h2>

                {!semaines.courante.aEvenement && (
                  <AucuneEntreeDansLaSemaine
                    periode={getLibelleSemaineEnCours()}
                  />
                )}

                {semaines.courante.aEvenement && (
                  <EntreesAgendaParJourDeLaSemaine
                    idBeneficiaire={idBeneficiaire}
                    numeroSemaine={0}
                    semaine={semaines.courante}
                  />
                )}
              </section>

              <section aria-labelledby='semaine-suivante' className='mt-6'>
                <h2
                  id='semaine-suivante'
                  className='text-m-bold text-primary mb-6'
                >
                  Semaine suivante
                </h2>

                {!semaines.suivante.aEvenement && (
                  <AucuneEntreeDansLaSemaine
                    periode={getLibelleSemaineSuivante()}
                  />
                )}

                {semaines.suivante.aEvenement && (
                  <EntreesAgendaParJourDeLaSemaine
                    idBeneficiaire={idBeneficiaire}
                    numeroSemaine={1}
                    semaine={semaines.suivante}
                  />
                )}
              </section>
            </>
          )}
        </>
      )}
    </>
  )
}

function preparerSemaines(
  dateDeDebut: DateTime,
  dateDeFin: DateTime
): {
  courante: SemaineAgenda
  suivante: SemaineAgenda
  separation: DateTime
} {
  const { courante, suivante } = {
    courante: {
      jours: {} as {
        [jour: string]: { date: DateTime; entrees: EntreeAgenda[] }
      },
      aEvenement: false,
    },
    suivante: {
      jours: {} as {
        [jour: string]: { date: DateTime; entrees: EntreeAgenda[] }
      },
      aEvenement: false,
    },
  }
  const separation = dateDeDebut.plus({ week: 1 })
  for (let date = dateDeDebut; date < dateDeFin; date = date.plus({ day: 1 })) {
    const semaine = date < separation ? courante : suivante
    semaine.jours[toMonthday(date)] = { date, entrees: [] }
  }
  return { courante, suivante, separation }
}

function AucuneEntreeDansLaSemaine({ periode }: { periode: string }) {
  return (
    <div className='rounded-base border border-grey_100 p-4'>
      <p className='text-base-medium mb-2'>{periode}</p>
      <p className='text-grey_800'>Pas d’action ni de rendez-vous</p>
    </div>
  )
}

function getLibelleSemaineEnCours(): string {
  const maintenant = DateTime.now()
  const lundi = maintenant.startOf('week')
  const dimanche = lundi.plus({ day: 6 })
  return `Du ${toMonthday(lundi)} au ${toMonthday(dimanche)}`
}

function getLibelleSemaineSuivante(): string {
  const maintenant = DateTime.now()
  const lundiSuivant = maintenant.plus({ week: 1 }).startOf('week')
  const dimancheSuivant = lundiSuivant.plus({ day: 6 })
  return `Du ${toMonthday(lundiSuivant)} au ${toMonthday(dimancheSuivant)}`
}
