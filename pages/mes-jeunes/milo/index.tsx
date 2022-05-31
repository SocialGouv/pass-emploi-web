import { withTransaction } from '@elastic/apm-rum-react'

function Milo() {
  return null
}

export const getServerSideProps = () => {
  return {
    redirect: {
      destination: '/mes-jeunes',
      permanent: true,
    },
  }
}

export default withTransaction(Milo.name, 'page')(Milo)
