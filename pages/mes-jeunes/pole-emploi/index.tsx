import { withTransaction } from '@elastic/apm-rum-react'

function PoleEmploi() {
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

export default withTransaction(PoleEmploi.name, 'page')(PoleEmploi)
