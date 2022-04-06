import { withTransaction } from '@elastic/apm-rum-react'

function JeuneConseillers() {
  return <>Historique des conseillers</>
}

export default withTransaction(JeuneConseillers.name, 'page')(JeuneConseillers)
