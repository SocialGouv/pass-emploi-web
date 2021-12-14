import { GetServerSideProps } from 'next'

type MiloCreationJeuneProps = {}

function MiloCreationJeune({}: MiloCreationJeuneProps) {
  return <></>
}

export const getServerSideProps: GetServerSideProps<
  MiloCreationJeuneProps
> = async ({}) => {
  return {
    props: {},
  }
}

export default MiloCreationJeune
