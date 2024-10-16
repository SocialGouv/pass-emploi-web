export default function Stats() {
  const iframeUrl = process.env.STATS_IFRAME_URL
  return (
    <>
      <header>
        <title>Statistiques du CEJ</title>
      </header>
      <iframe
        title="Statistiques d'usage de l'Application du CEJ"
        src={iframeUrl}
        className='fixed top-0 left-0 w-full h-full border-0'
      ></iframe>
    </>
  )
}
