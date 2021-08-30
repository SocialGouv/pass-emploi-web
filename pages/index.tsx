import type { NextPage } from 'next'
import Link from 'next/link'



const Home: NextPage = () => {

  
  return (
    <>
      <h1 className='h1'>Titre principal</h1>
      <Link href="/jeunes/kendji/actions">
        <a>Actions de Kendji</a>
      </Link>

    </>
  )
}

export default Home
