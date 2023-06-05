import IconSettingsChrome from 'assets/icons/custom/settings_chrome.svg'
import IconSettingsSafari from 'assets/icons/custom/settings_safari.svg'

export function TutorielRaccourci() {
  return (
    <>
      <p>
        Pour retrouver facilement votre application du CEJ, vous pouvez ajouter
        simplement un raccourci sur votre téléphone.
      </p>
      <p>
        Il apparaîtra sur votre écran d’accueil à côté de vos autres
        applications.
      </p>
      <h2 className='text-l-bold mt-6'>Comment faire ?</h2>
      <h3 className='text-base-bold mt-6'>
        Sur Chrome (sur téléphone Android)
      </h3>
      <p>
        Tapez sur Plus
        <IconSettingsChrome
          role='img'
          focusable={false}
          aria-label='Plus'
          className='inline w-6 h-6'
        />
        puis &quot;Ajouter à l&apos;écran d&apos;accueil&quot;
      </p>
      <h3 className='text-base-bold mt-6'>Sur Safari (sur iPhone)</h3>
      <p>
        Tapez sur
        <IconSettingsSafari
          role='img'
          focusable={false}
          aria-label='bouton Partager'
          className='inline w-8 h-8'
        />
        puis &quot;Sur l&apos;écran d&apos;accueil&quot;
      </p>
    </>
  )
}
