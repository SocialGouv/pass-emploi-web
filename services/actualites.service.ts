import sanitizeHtml from 'sanitize-html'

import {
  ActualitesRaw,
  ArticleJson,
  EtiquetteArticle,
  TagJson,
} from 'interfaces/actualites'
import { StructureConseiller } from 'interfaces/conseiller'
import { fetchJson } from 'utils/httpClient'

export async function getActualites(
  structure: StructureConseiller
): Promise<ActualitesRaw | undefined> {
  const urlTags = process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS
  const urlActualites = getUrlActualites(structure)
  if (!urlTags || !urlActualites) return

  const [{ content: tagsJson }, { content: articlesJson }]: [
    { content: TagJson[] },
    { content: ArticleJson[] },
  ] = await Promise.all([fetchJson(urlTags), fetchJson(urlActualites)])
  if (!articlesJson.length) return

  const derniereDateModification = articlesJson.reduce(
    (latest: string, item: ArticleJson) => {
      return new Date(item.modified) > new Date(latest) ? item.modified : latest
    },
    articlesJson[0].modified
  )

  return {
    articles: articlesJson.map((article: ArticleJson) => ({
      id: article.id,
      titre: article.title.rendered,
      etiquettes: extraireEtiquettes(article, tagsJson),
      contenu: extraireContenuAssaini(article),
    })),
    dateDerniereModification: derniereDateModification,
  }
}

function extraireContenuAssaini({ content }: ArticleJson): string {
  return sanitizeHtml(content.rendered, {
    disallowedTagsMode: 'recursiveEscape',
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  })
}

function extraireEtiquettes(
  article: ArticleJson,
  tagsJson: TagJson[]
): EtiquetteArticle[] {
  return article.tags
    .map((idTag) => tagsJson.find(({ id }) => id === idTag))
    .filter((tag) => tag !== undefined)
    .map((tag) => ({
      id: tag!.id,
      nom: tag!.name,
      couleur: tag!.description,
    }))
}

function getUrlActualites(structure: StructureConseiller) {
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
}
