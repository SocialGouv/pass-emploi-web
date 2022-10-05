import { GetServerSideProps } from 'next'

export default function Offres() {
  return null
}

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return {
    redirect: {
      destination: '/recherche-offres',
      permanent: false,
    },
  }
}
