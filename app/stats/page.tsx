export default function Stats() {
  return (
    <>
      <header>
        <title>Statistiques du CEJ</title>
      </header>
      <iframe
        title="Statistiques d'usage de l'Application du CEJ"
        src='https://stats.pass-emploi.beta.gouv.fr/public/dashboard/540b3ab7-c800-4531-80d1-2b416b77f186'
        className='fixed top-0 left-0 w-full h-full border-0'
      ></iframe>
    </>
  )
}
