import sanitizeHtml from 'sanitize-html'

import {
  ActualitesRaw,
  ArticleJson,
  EtiquetteArticle,
  TagJson,
} from 'interfaces/actualites'
import { Structure } from 'interfaces/structure'
import { fetchJson } from 'utils/httpClient'

export async function getActualites(
  structure: Structure
): Promise<ActualitesRaw | undefined> {
  const urlTags = process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_TAGS
  const urlActualites = getUrlActualites(structure)
  if (!urlTags || !urlActualites) return

  const [{ content: tagsJson }, { content: articlesJson }]: [
    { content: TagJson[] },
    { content: ArticleJson[] },
  ] = await Promise.all([fetchJson(urlTags), fetchJson(urlActualites)])
  if (!articlesJson.length) return

  return [...articlesJson]
    .sort(comparerArticles)
    .map((article: ArticleJson) => ({
      id: article.id,
      titre: article.title.rendered,
      etiquettes: extraireEtiquettes(article, tagsJson),
      contenu: extraireContenuAssaini(article),
      dateDerniereModification: article.modified,
    }))
}

function comparerArticles(a1: ArticleJson, a2: ArticleJson) {
  const stickyFirst = Number(a2.sticky) - Number(a1.sticky)
  if (stickyFirst !== 0) return stickyFirst

  return new Date(a2.modified).getTime() - new Date(a1.modified).getTime()
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
    .map((tag) => ({ id: tag.id, nom: tag.name, couleur: tag.description }))
}

function getUrlActualites(structure: Structure): string {
  switch (structure) {
    case 'MILO':
      return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_MILO_LINK as string
    case 'POLE_EMPLOI':
      return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_FT_CEJ_LINK as string
    case 'CONSEIL_DEPT':
      return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_CD_LINK as string
    case 'AVENIR_PRO':
      return process.env.NEXT_PUBLIC_WORDPRESS_ACTUS_AVENIR_PRO_LINK as string
    case 'POLE_EMPLOI_BRSA':
    case 'POLE_EMPLOI_AIJ':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return process.env
        .NEXT_PUBLIC_WORDPRESS_ACTUS_ACCOMPAGNEMENTS_INTENSIFS_LINK as string
  }
}
