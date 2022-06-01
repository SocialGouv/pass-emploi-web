import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

function Supervision() {
  return null
}

export const getServerSideProps: GetServerSideProps<{}> = async () => {
  return {
    redirect: {
      destination: '/supervision/reaffectation',
      permanent: true,
    },
  }
}

export default withTransaction(Supervision.name, 'page')(Supervision)
