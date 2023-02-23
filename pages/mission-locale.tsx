import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { RechercheJeune } from 'components/jeune/RechercheJeune'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

type MissionLocaleProps = PageProps

const MissionLocale = (_: MissionLocaleProps) => {
  const [conseiller] = useConseiller()
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const [rechercheJeunes, updateRechercheJeunes] = useState<BaseJeune[]>([])

  async function onRechercheJeunes(q: string) {
    if (conseiller?.agence?.id) {
      await jeunesService
        .rechercheJeunesDeLEtablissement(conseiller.agence.id, q)
        .then((jeunes) => {
          updateRechercheJeunes(jeunes)
        })
    }
  }

  return (
    <>
      <RechercheJeune onSearchFilterBy={(query) => onRechercheJeunes(query)} />
      {Boolean(rechercheJeunes.length) && (
        <div className='mt-6'>
          <Table
            asDiv={true}
            caption={{
              text: `Résultat de recherche (${rechercheJeunes.length})`,
              visible: true,
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH>
                  <span className='mr-1'>Bénéficiaire</span>
                </TH>
                <TH>
                  <span className='mr-1'></span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {rechercheJeunes.map((jeune) => (
                <TR key={jeune.id} label={`${jeune.prenom} ${jeune.nom}`}>
                  <TD isBold className='rounded-l-base'>
                    <span className='flex items-baseline'>
                      {getNomJeuneComplet(jeune)}
                    </span>
                  </TD>
                  <TD></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  MissionLocaleProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return { notFound: true }

  return {
    props: {
      pageTitle: 'Mission Locale',
    },
  }
}

export default withTransaction(MissionLocale.name, 'page')(MissionLocale)
