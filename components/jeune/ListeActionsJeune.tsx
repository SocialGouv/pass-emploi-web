import Link from 'next/link'
import React from 'react'

interface ListeActionsJeuneProps {
  idJeune: string
}

const ListeActionsJeune = ({ idJeune }: ListeActionsJeuneProps) => {
  return (
    <Link href={`/mes-jeunes/${idJeune}/actions`}>
      <a className='text-sm text-bleu_nuit underline'>
        Voir la liste des actions du jeune
      </a>
    </Link>
  )
}

export default ListeActionsJeune
