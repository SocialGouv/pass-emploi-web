import { domToReact } from 'html-react-parser'

export type ActualitesRaw = {
  articles: Array<{
    contenu: string
    id: string
    titre: string
  }>
  dateDerniereModification: string
}

export type ActualitesParsees = {
  articles: Array<{
    contenu: ReturnType<typeof domToReact>
    id: string
    titre: ReturnType<typeof domToReact>
  }>
  dateDerniereModification: string
}

export type ArticleJson = {
  modified: string
  content: {
    rendered: string
  }
  title: {
    rendered: string
  }
  id: string
}
