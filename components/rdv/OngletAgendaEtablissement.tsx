import { DateTime } from 'luxon'
import React, { ReactElement, useEffect, useState } from 'react'

import { AgendaData, AgendaRows, buildAgendaData } from 'components/AgendaRows'
import EmptyState from 'components/EmptyState'
import FiltresStatutAnimationsCollectives from 'components/rdv/FiltresStatutAnimationsCollectives'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { TagMetier, TagStatut } from 'components/ui/Indicateurs/Tag'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { estMilo, peutAccederAuxSessions } from 'interfaces/conseiller'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchTime, toMonthday } from 'utils/date'

type OngletAgendaEtablissementProps = {
  recupererAnimationsCollectives: (
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<AnimationCollective[]>
  recupererSessionsMilo: (
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<AnimationCollective[]>
  trackNavigation: (append?: string) => void
  periodeIndex: number
  changerPeriode: (index: number) => void
}

export default function OngletAgendaEtablissement({
  recupererAnimationsCollectives,
  recupererSessionsMilo,
  trackNavigation,
  periodeIndex,
  changerPeriode,
}: OngletAgendaEtablissementProps) {
  const [conseiller] = useConseiller()
  const [evenements, setEvenements] = useState<AnimationCollective[]>()
  const [evenementsFiltres, setEvenementsFiltres] =
    useState<AnimationCollective[]>()

  const [agendaEvenements, setAgendaEvenements] =
    useState<AgendaData<AnimationCollective>>()
  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [failed, setFailed] = useState<boolean>(false)

  const [statutsValides, setStatutsValides] = useState<
    StatutAnimationCollective[]
  >([])

  async function chargerNouvellePeriode(
    nouvellePeriodeIndex: number,
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    await chargerEvenementsPeriode(dateDebut, dateFin)
    changerPeriode(nouvellePeriodeIndex)
  }

  async function chargerEvenementsPeriode(
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    setFailed(false)
    setAgendaEvenements(undefined)

    try {
      const animationsCollectives = await recupererAnimationsCollectives(
        dateDebut,
        dateFin
      )

      if (peutAccederAuxSessions(conseiller)) {
        const sessions = await recupererSessionsMilo(dateDebut, dateFin)
        setEvenements([...sessions, ...animationsCollectives])
      } else {
        setEvenements([...animationsCollectives])
      }
    } catch (e) {
      setFailed(true)
    } finally {
      setPeriode({ debut: dateDebut, fin: dateFin })
    }
  }

  function filtrerEvenements(aFiltrer: AnimationCollective[]) {
    if (!statutsValides.length) setEvenementsFiltres(aFiltrer)
    else {
      const acFiltrees = aFiltrer.filter(
        (ac) => ac.statut && statutsValides.includes(ac.statut)
      )
      setEvenementsFiltres(acFiltrees)
    }
  }

  useEffect(() => {
    if (evenements) {
      filtrerEvenements(evenements)
    }
  }, [evenements, statutsValides])

  useEffect(() => {
    if (evenementsFiltres && periode) {
      setAgendaEvenements(
        buildAgendaData(evenementsFiltres, periode, ({ date }) => date)
      )
    }
  }, [evenementsFiltres, periode])

  function getHref(ac: AnimationCollective): string {
    if (ac.isSession) return `agenda/sessions/${ac.id}`
    else return `/mes-jeunes/edition-rdv?idRdv=${ac.id}`
  }

  return (
    <>
      <SelecteurPeriode
        nombreJours={7}
        onNouvellePeriode={chargerNouvellePeriode}
        periodeCourante={periodeIndex}
        trackNavigation={trackNavigation}
      />

      {!agendaEvenements && !failed && (
        <EmptyState
          illustrationName={IllustrationName.Sablier}
          titre={`
            L’affichage de l’agenda de votre ${
              estMilo(conseiller) ? 'Mission Locale' : 'établissement'
            } peut prendre quelques instants.
          `}
          sousTitre='Veuillez patienter pendant le chargement des informations.'
        />
      )}

      {!agendaEvenements && failed && (
        <EmptyState
          illustrationName={IllustrationName.Maintenance}
          titre={`
            L’affichage de l’agenda de votre ${
              estMilo(conseiller) ? 'Mission Locale' : 'établissement'
            } a échoué.
          `}
          sousTitre='Si le problème persiste, contactez notre support.'
          bouton={{
            onClick: () =>
              chargerEvenementsPeriode(periode!.debut, periode!.fin),
            label: 'Réessayer',
          }}
        />
      )}

      {agendaEvenements && evenementsFiltres!.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyState
            illustrationName={IllustrationName.Checklist}
            titre={
              statutsValides.length === 0
                ? 'Il n’y a pas d’animation collective sur cette période dans votre établissement.'
                : 'Aucune animation collective ne correspond au(x) filtre(s) sélectionné(s) sur cette période.'
            }
            lien={{
              href: '/mes-jeunes/edition-rdv?type=ac',
              label: 'Créer une animation collective',
              iconName: IconName.Add,
            }}
          />

          {evenements!.length > 0 && (
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={() => setStatutsValides([])}
              className='m-auto mt-8'
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {agendaEvenements && evenements!.length > 0 && (
        <Table
          asDiv={true}
          caption={{
            text: 'Liste des animations collectives de mon établissement',
          }}
        >
          <THead>
            <TR isHeader={true}>
              <TH>Horaires</TH>
              <TH>Titre</TH>
              <TH>Type</TH>
              <TH
                title={
                  'Les sessions i-milo visibles ou non par les bénéficiaires de votre Mission Locale.'
                }
              >
                Visible{' '}
                <IconComponent
                  name={IconName.Info}
                  className='inline h-4 w-4 fill-primary'
                  aria-label='Les sessions i-milo visibles ou non par les bénéficiaires de votre Mission Locale.'
                />
              </TH>
              <TH estCliquable={true}>
                <FiltresStatutAnimationsCollectives
                  onFiltres={setStatutsValides}
                  defaultValue={statutsValides}
                />
              </TH>
            </TR>
          </THead>
          <TBody>
            <AgendaRows
              agenda={agendaEvenements}
              Item={({ item: ac }) => (
                <TR key={ac.id} href={getHref(ac)} label={labelLien(ac)}>
                  <TD>
                    {toFrenchTime(ac.date)} - {ac.duree} min
                  </TD>
                  <TD>
                    {ac.titre}
                    <span className='block text-s-regular'>{ac.sousTitre}</span>
                  </TD>
                  <TD>{tagType(ac)}</TD>
                  <TD className='flex text-center'>
                    <IconComponent
                      aria-label={ac.estCache ? 'Non visible' : 'Visible'}
                      className='inline h-6 w-6 fill-primary'
                      focusable={false}
                      name={
                        ac.estCache
                          ? IconName.VisibilityOff
                          : IconName.VisibilityOn
                      }
                      role='img'
                      title={ac.estCache ? 'Non visible' : 'Visible'}
                    />
                  </TD>
                  <TD>
                    <div className='flex items-center justify-between'>
                      {ac.statut && tagStatut(ac)}
                      {!ac.statut && (
                        <>
                          -
                          <span className='sr-only'>
                            information non disponible
                          </span>
                        </>
                      )}
                      <IconComponent
                        name={IconName.ChevronRight}
                        focusable={false}
                        aria-hidden={true}
                        className='w-6 h-6 fill-primary'
                      />
                    </div>
                  </TD>
                </TR>
              )}
            />
          </TBody>
        </Table>
      )}
    </>
  )
}

function labelLien(ac: AnimationCollective): string {
  return `Consulter ${ac.type} ${statusProps(ac).label} du ${toMonthday(
    ac.date
  )} à ${toFrenchTime(ac.date)}`
}

function tagType({ isSession, type }: AnimationCollective): ReactElement {
  let tagProps: { color: string; iconName?: IconName; iconLabel?: string } = {
    color: 'additional_2',
    iconName: undefined,
    iconLabel: undefined,
  }

  if (type === 'Atelier') tagProps.color = 'accent_2'
  if (type === 'Information collective') tagProps.iconName = IconName.Error
  if (isSession)
    tagProps = {
      color: 'accent_1',
      iconName: IconName.Lock,
      iconLabel: 'Informations de la session non modifiables',
    }

  return (
    <TagMetier
      label={type}
      color={tagProps.color}
      backgroundColor={tagProps.color + '_lighten'}
      iconName={tagProps.iconName}
      iconLabel={tagProps.iconLabel}
    />
  )
}

function statusProps({ type, statut }: AnimationCollective): {
  label: string
  color: string
} {
  switch (statut) {
    case StatutAnimationCollective.AVenir:
      return { label: 'À venir', color: 'accent_1' }
    case StatutAnimationCollective.AClore:
      return { label: 'À clore', color: 'warning' }

    case StatutAnimationCollective.Close:
      return {
        label: type === 'Atelier' ? 'Clos' : 'Close',
        color: 'accent_2',
      }
    case undefined:
      return {
        label: '',
        color: '',
      }
  }
}

function tagStatut(ac: AnimationCollective): JSX.Element {
  const { label, color } = statusProps(ac)
  return (
    <TagStatut
      label={label}
      color={color}
      backgroundColor={color + '_lighten'}
    />
  )
}
