import { createContext, useContext } from 'react'

const MessageErreurDossierContext = createContext<string | null>(null)

const useMessageErreurDossierContext = () => {
  return useContext(MessageErreurDossierContext)
}

export { MessageErreurDossierContext, useMessageErreurDossierContext }
