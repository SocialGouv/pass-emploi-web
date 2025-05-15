export type MetadonneesPagination = {
  nombrePages: number
  nombreTotal: number
}

export type MetadonneesPilotage = MetadonneesPagination & {
  nombreAC: number
  nombreRdvs: number
}
