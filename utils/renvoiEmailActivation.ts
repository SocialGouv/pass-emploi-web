export const EMAIL_ACTIVATION_STORAGE_KEY = 'dernierRenvoiEmailActivation'
export const DELAI_RENVOI_EMAIL_ACTIVATION = 24 * 60 * 60 * 1000

export type EmailActivation = {
  idBeneficiaire: string
  date: number
}

function recupereHistoriqueRenvois(): EmailActivation[] {
  const data = localStorage.getItem(EMAIL_ACTIVATION_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function sauvegardeHistorique(history: EmailActivation[]) {
  localStorage.setItem(EMAIL_ACTIVATION_STORAGE_KEY, JSON.stringify(history))
}

export function peutRenvoyerEmailActivation(idBeneficiaire: string): boolean {
  const historiqueRenvois = recupereHistoriqueRenvois()
  console.log(
    `Stockage du renvoi d'email pour l'id ${idBeneficiaire}`,
    historiqueRenvois
  )
  const entry = historiqueRenvois.find(
    (renvoi) => renvoi.idBeneficiaire === idBeneficiaire
  )
  if (!entry) return true

  return Date.now() - entry.date > DELAI_RENVOI_EMAIL_ACTIVATION
}

export function stockeRenvoiEmail(idBeneficiaire: string) {
  const historiqueRenvois = recupereHistoriqueRenvois()
  const existing = historiqueRenvois.find(
    (renvoi) => renvoi.idBeneficiaire === idBeneficiaire
  )

  if (existing) {
    existing.date = Date.now()
  } else {
    historiqueRenvois.push({ idBeneficiaire, date: Date.now() })
  }

  sauvegardeHistorique(historiqueRenvois)
}
