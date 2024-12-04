import sanitizeHtml from 'sanitize-html'

import { ActualitesRaw, ArticleJson } from 'interfaces/actualites'
import { StructureConseiller } from 'interfaces/conseiller'
import { fetchJson } from 'utils/httpClient'

export async function getActualites(
  structure: StructureConseiller
): Promise<ActualitesRaw | undefined> {
  const url = ((): string => {
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
      case StructureConseiller.AVENIR_PRO:
        return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_AVENIR_PRO_LINK as string
    }
  })()

  if (!url) return

  const articlesJson = await fetchJson(url)

  const derniereDateModification = articlesJson.content.reduce(
    (latest: string, item: ArticleJson) => {
      return new Date(item.modified) > new Date(latest) ? item.modified : latest
    },
    articlesJson.content[0].modified
  )

  return {
    articles: articlesJson.content.map((article: ArticleJson) => ({
      id: article.id,
      contenu: formaterArticle(article),
      titre: article.title.rendered,
    })),
    dateDerniereModification: derniereDateModification,
  }
}

function formaterArticle({ content }: ArticleJson): string {
  const contentAssaini = sanitizeHtml(content.rendered, {
    disallowedTagsMode: 'recursiveEscape',
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  })

  return ajouterTagCategorie(contentAssaini)
}

function ajouterTagCategorie(str: string): string {
  const codeRegex = /<code\b[^>]*>([\s\S]*?)<\/code>/

  const baliseCode = str.match(codeRegex)
  if (!baliseCode) return str
  const baliseCodeContent = baliseCode[1]

  const tags = baliseCodeContent.split(',').map((word) => word.trim())

  const categories = tags
    .map((tag) => {
      return `<span className='flex items-center w-fit text-s-medium text-additional_3 px-3 bg-additional_3_lighten whitespace-nowrap rounded-full'>${tag}</span>`
    })
    .join('')

  return str.replace(
    /<pre\b[^>]*>[\s\S]*?<\/pre>/g,
    `<div className='flex gap-2'>${categories}</div>`
  )
}
