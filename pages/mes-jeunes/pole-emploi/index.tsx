function Milo() {
  return <></>
}

export const getServerSideProps = () => {
  return {
    redirect: {
      destination: '/mes-jeunes',
      permanent: true,
    },
  }
}

export default Milo
