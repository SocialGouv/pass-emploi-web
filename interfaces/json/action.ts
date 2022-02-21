export type ActionJeuneJson = {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  status: 'not_started' | 'in_progress' | 'done'
  creator: string
  creatorType: string
}
