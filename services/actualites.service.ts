import { Actualites } from 'interfaces/actualites'
import { StructureConseiller } from 'interfaces/conseiller'
import { fetchJson } from 'utils/httpClient'

// ******* READ *******
export async function getActualites(
  structure: StructureConseiller
): Promise<Actualites | undefined> {
  const url = ((): string | undefined => {
    switch (structure) {
      case StructureConseiller.MILO:
        return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_MILO_LINK as string
      case StructureConseiller.POLE_EMPLOI:
        return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_FT_CEJ_LINK as string
      case StructureConseiller.POLE_EMPLOI_BRSA:
        return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_FR_BRSA_LINK as string
      case StructureConseiller.POLE_EMPLOI_AIJ:
        return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_FR_AIJ_LINK as string
      case StructureConseiller.CONSEIL_DEPT:
        return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_CD_LINK as string
    }
  })()

  if (!url) return

  const {
    content: {
      modified,
      content: { rendered },
    },
  }: {
    content: { modified: string; content: { rendered: string } }
    headers: Headers
  } = await fetchJson(url)

  return { contenu: rendered, dateDerniereModification: modified }
}
