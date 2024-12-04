import { domToReact } from 'html-react-parser'

export type ActualitesRaw = {
  articles: Array<{
    id: number
    titre: string
    etiquettes: EtiquetteArticle[]
    contenu: string
  }>
  dateDerniereModification: string
}

export type ActualitesParsees = {
  articles: Array<{
    id: number
    titre: ReturnType<typeof domToReact>
    etiquettes: EtiquetteArticle[]
    contenu: ReturnType<typeof domToReact>
  }>
  dateDerniereModification: string
}

export type ArticleJson = {
  id: number
  modified: string
  title: {
    rendered: string
  }
  tags: number[]
  content: {
    rendered: string
  }
}

export type TagJson = {
  id: number
  name: string
  description: string
}

export type EtiquetteArticle = {
  id: number
  nom: string
  couleur: string
}
