import { ActualitesParsees, ActualitesRaw } from 'interfaces/actualites'

export function uneActualite(): ActualitesParsees {
  return {
    articles: [
      {
        id: 1,
        titre: 'Invitation à la journée présentiel du 31 octobre 2024',
        etiquettes: [{ couleur: 'primary', id: 7, nom: 'Primaire' }],
        contenu: [
          <p key={0}>Rdv demain aux nouveaux locaux de la Fabrique</p>,
          <a
            key={1}
            href='perdu.com'
            target='_blank'
            rel='noreferrer noopener'
            className='inline-flex items-center whitespace-nowrap underline'
            aria-label='Vous êtes perdu ? (nouvelle fenêtre)'
          >
            Vous êtes perdu ?
            <svg
              aria-hidden={true}
              focusable={false}
              viewBox='0 0 12 12'
              className='ml-1 w-3 h-3'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M10 10.6667H2C1.63333 10.6667 1.33333 10.3667 1.33333 10V2C1.33333 1.63333 1.63333 1.33333 2 1.33333H5.33333C5.7 1.33333 6 1.03333 6 0.666667C6 0.3 5.7 0 5.33333 0H1.33333C0.593333 0 0 0.6 0 1.33333V10.6667C0 11.4 0.6 12 1.33333 12H10.6667C11.4 12 12 11.4 12 10.6667V6.66667C12 6.3 11.7 6 11.3333 6C10.9667 6 10.6667 6.3 10.6667 6.66667V10C10.6667 10.3667 10.3667 10.6667 10 10.6667ZM7.33333 0.666667C7.33333 1.03333 7.63333 1.33333 8 1.33333H9.72667L3.64 7.42C3.38 7.68 3.38 8.1 3.64 8.36C3.9 8.62 4.32 8.62 4.58 8.36L10.6667 2.27333V4C10.6667 4.36667 10.9667 4.66667 11.3333 4.66667C11.7 4.66667 12 4.36667 12 4V0H8C7.63333 0 7.33333 0.3 7.33333 0.666667Z'
                fill='currentColor'
              />
            </svg>
          </a>,
        ],
      },
    ],
    dateDerniereModification: '2024-10-30',
  }
}

export function uneActualiteRaw(): ActualitesRaw {
  return {
    articles: [
      {
        id: 1,
        titre: 'Invitation à la journée présentiel du 31 octobre 2024',
        etiquettes: [],
        contenu:
          '<p /><p>Rdv demain aux nouveaux locaux de la Fabrique</p>    <p/><a href="perdu.com">Vous êtes perdu ?</a><p></p>',
      },
    ],
    dateDerniereModification: '2024-10-30',
  }
}
