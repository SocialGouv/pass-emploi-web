import { GetServerSideProps } from 'next'

export default function Actions() {
  return null
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return {
    redirect: {
      destination:
        context.resolvedUrl.replace('/actions', '') + '?onglet=actions',
      permanent: false,
    },
  }
}
