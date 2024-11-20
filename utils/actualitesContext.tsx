'use client'

import parse from 'html-react-parser'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { ActualitesParsees } from 'interfaces/actualites'
import { getActualites } from 'services/actualites.service'
import { useConseiller } from 'utils/conseiller/conseillerContext'

const ActualitesContext = createContext<ActualitesParsees | undefined>(
  undefined
)

export function ActualitesProvider({
  children,
  actualitesForTests,
}: {
  children: ReactNode
  actualitesForTests?: ActualitesParsees
}) {
  const [actualites, setActualites] = useState<ActualitesParsees | undefined>(
    actualitesForTests
  )
  const [conseiller] = useConseiller()

  useEffect(() => {
    if (actualites === undefined)
      getActualites(conseiller.structure).then((actualitesRaw) => {
        setActualites(
          actualitesRaw && {
            ...actualitesRaw,
            articles: actualitesRaw.articles.map((article) => ({
              ...article,
              contenu: parse(article.contenu),
            })),
          }
        )
      })
  }, [actualites])

  return (
    <ActualitesContext.Provider value={actualites}>
      {children}
    </ActualitesContext.Provider>
  )
}

export function useActualites(): ActualitesParsees | undefined {
  return useContext(ActualitesContext)
}
