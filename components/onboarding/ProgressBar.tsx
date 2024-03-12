export default function ProgressBar({
  etapeCourante,
  etapes,
}: {
  etapeCourante: number
  etapes: number
}) {
  const texteInformatifEtape = `Étape ${etapeCourante} sur ${etapes}`

  return (
    <div
      className='flex justify-center gap-2 w-full mt-4'
      role='progressbar'
      aria-valuemin={1}
      aria-valuemax={etapes}
      aria-valuenow={etapeCourante}
      aria-valuetext={texteInformatifEtape}
      aria-label={texteInformatifEtape}
      title={texteInformatifEtape}
    >
      {Array.from({ length: etapes }, (_, index) => (
        <div
          key={index}
          aria-hidden={true}
          className={`w-[10px] h-[10px] rounded-full ${index + 1 === etapeCourante ? 'bg-primary' : 'bg-grey_500'}`}
        />
      ))}
      <span className='sr-only'>{texteInformatifEtape}</span>
    </div>
  )
}
