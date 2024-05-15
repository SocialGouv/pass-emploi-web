import React from 'react'

import InformationMessage from 'components/ui/Notifications/InformationMessage'

export default function ContenuCGUConseillerCEJ() {
  return (
    <>
      <InformationMessage label='Nous mettons à jour nos conditions générales d’utilisation. Veuillez les lire, cochez la case et valider pour pouvoir continuer à utiliser l’application.' />
      <p className='my-8'>
        Les présentes conditions générales d’utilisation (dites « CGU ») fixent
        le cadre juridique de la Plateforme « Contrat d’Engagement Jeune » ou
        “CEJ” et définissent les conditions d’accès et d’utilisation des
        services par l’Utilisateur.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 1 – Champ d’application
      </h2>
      <p className='mb-4'>
        Tout jeune qui est en situation de décrochage peut créer un compte via
        l’application « CEJ » et utiliser l’application pour être accompagné
        dans sa recherche, pour trouver des ressources ou pour être accompagné
        dans son projet professionnel en général.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>Article 2 – Objet</h2>
      <p className='mb-4'>
        La plateforme CEJ a pour objet de contribuer à la diminution du
        décrochage des jeunes en accompagnement vers l’emploi. En ce sens, elle
        cherche à améliorer la mise en relation des jeunes et leur conseiller ou
        conseillère, force de proposition d’actions et conseils aux jeunes.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 3 – Définitions
      </h2>
      <p className='mb-4'>
        « Le Conseiller » est tout agent public ou bénévole utilisant
        l’application CEJ, accompagnant les jeunes dans leur recherche
        professionnelle, ou dans la création de leur projet.
      </p>
      <p className='mb-4'>
        « L’Usager » est tout jeune en situation de « décrochage », s’étant créé
        un compte, accompagné dans sa recherche par un Conseiller, souhaitant
        trouver des ressources ou être accompagné dans son projet professionnel
        en général. Cette situation de décrochage peut notamment s’exprimer par
        des difficultés dans la recherche d’emploi ou de formation, dans le
        suivi, ou le manque de connaissances et de renseignements sur ces
        sujets.
      </p>
      <p className='mb-4'>
        « Le Superviseur » est un agent ayant un rôle d’encadrement et
        d’organisation général des Conseillers et de leur prise en charge des
        Usagers.
      </p>
      <p className='mb-4'>
        Les « Services » sont les fonctionnalités offertes par la plateforme
        pour répondre à son objet défini à l’article 2.
      </p>
      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 4 – Fonctionnalités
      </h2>
      <p className='mb-4'>
        La création d’un profil est ouverte à tout « Conseiller », souhaitant
        utiliser la plateforme dans les conditions prévues. En outre, le profil
        « Superviseur » permet aux agents habilités d’organiser et de modifier
        l’affectation d’un jeune à un Conseiller déterminé.
      </p>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        A- Conseiller en Mission Locale
      </h4>
      <p className='mb-4'>
        L’authentification se fait via les identifiants de l’outil professionnel
        i-Milo : un identifiant et un mot de passe. Si l’utilisateur est déjà
        authentifié dans son outil i-Milo (également une web app), il accède à
        son portail CEJ sans écran d’authentification. Si l’utilisateur n’est
        pas encore authentifié dans son i-Milo, il s’authentifie via la mire de
        connexion i-Milo.
      </p>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        B- Conseiller France Travail
      </h4>
      <p className='mb-4'>
        L’authentification se fait via les identifiants métier France Travail
        (système « PEAMA ») : le DGASI et un mot de passe. Par ailleurs ces
        Conseillers pourront ajouter le numéro France Travail des jeunes suivis.
      </p>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.2 Création et gestion des actions possibles
      </h3>
      <p className='mb-4'>Ces actions se font :</p>
      <ul className='list-disc mb-8 ml-8'>
        <li>
          soit via l’application CEJ pour les « Conseillers Mission Locale » ;
        </li>
        <li>
          soit via l’outil mis à disposition par « France Travail » sur MAP.
        </li>
      </ul>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        A – Création, visualisation des actions
      </h4>
      <p className='mb-4'>Chaque Conseiller peut, sur son tableau de bord :</p>
      <ul className='list-disc mb-8 ml-8'>
        <li>
          Créer une action que l’Usager aura à faire ; Il devra alors nommer
          l’action, la décrire et en définir le statut (à réaliser, commencée ou
          terminée) et renseigner une date d’échéance ;
        </li>
        <li>
          Visualiser toutes les actions concernant les Usagers qu’il accompagne
          ; Ces actions sont triées selon leur statut ; commenter une action et
          échanger avec ses Usagers sur les actions à réaliser.
        </li>
      </ul>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        B – Questions sur les actions
      </h4>
      <p className='mb-4'>
        A tout moment, l’Usager peut interroger son Conseiller sur l’action
        qu’il a créé, ou que le Conseiller a créé pour lui. Les questions
        peuvent notamment permettre une meilleure compréhension de l’action à
        faire et améliorer la communication sur les difficultés rencontrées.
      </p>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        C – Gestion des actions sur i-milo
      </h4>
      <p className='mb-4'>
        Les Conseillers « Missions locales » peuvent intégrer les actions
        renseignées dans l’application CEJ dans le dossier du jeune sur i-milo.
      </p>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.3 Prise et organisation de rendez-vous
      </h3>
      <p className='mb-4'>
        Les Conseillers peuvent prendre des rendez-vous avec des « Usagers » et
        en choisir les modalités (nom de l’Usager, date du rendez-vous,
        modalités de contact, notes spécifiques à communiquer). Le rendez-vous
        mentionne toujours la date, l’horaire, le lieu et le moyen de contact.
        Ils peuvent rechercher un Usager avec lequel ils ont un rendez-vous et
        supprimer des rendez-vous directement. Cette action sera notifiée à
        l’Usager.
      </p>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.4 Réception de notifications
      </h3>
      <p className='mb-4'>
        Les Conseillers peuvent recevoir des notifications dès lors qu’un Usager
        a interagi avec eux, notamment pour annuler ou confirmer un rendez-vous,
        ou lorsqu’ils reçoivent un message via le chat.
      </p>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.5 Ouvrir un chat de discussion direct
      </h3>
      <p className='mb-4'>
        Chaque Conseiller peut rechercher un Usager dont il a la charge et
        échanger avec lui sur les sujets qui le concernent via un chat.
        Réciproquement, les Usagers peuvent entrer en discussion directement
        avec leur Conseiller.
      </p>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.6 Organisation des affectations
      </h3>
      <p className='mb-4'>
        Les profils Superviseurs peuvent visualiser l’ensemble des « Profil
        Conseillers » sous leur supervision, ainsi que les profils « Usagers »
        qu’ils gèrent. Ils peuvent modifier l’affectation d’un jeune via une
        fonctionnalité qui leur est propre. Le changement d’affectation d’un
        jeune doit donner lieu à une affectation à un autre Conseiller.
      </p>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.7 Autres fonctionnalités
      </h3>
      <p className='mb-4'>
        D’autres fonctionnalités sont ouvertes aux Conseillers. Certaines
        fonctionnalités dépendent des catégories de comptes :
      </p>
      <ul className='list-disc mb-8 ml-8'>
        <li>
          Si le jeune ne l’a pas refusé, tous les Conseillers peuvent visualiser
          les offres et recherches sauvegardées ;
        </li>
        <li>
          Tous les conseillers ont accès à un bouton « Actualités » leur
          présentant les nouveautés de l’application ;
        </li>
        <li>Échanger des pièces jointes ouvrables par les Jeunes.</li>
      </ul>

      <h3 className='text-base-bold text-content_color mt-2 mb-2'>
        4.8 Suppressions du compte
      </h3>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        A – Suppression par l’Usager
      </h4>
      <p className='mb-4'>
        Les Usagers peuvent supprimer leur compte sur l’application à tout
        moment en cliquant sur le bouton « Supprimer ». Il perdra toutes les
        informations liées au compte. <br />
        Néanmoins, s’il était suivi par un agent France Travail, ses actions et
        ses rendez-vous seront conservées dans l’outil France Travail.
      </p>
      <h4 className='mb-2 mt-2 text-s-bold text-accent_2'>
        B – Suppression par le Conseiller
      </h4>
      <p className='mb-4'>
        Les Conseillers peuvent également supprimer le compte d’un usager qu’il
        suit en cliquant sur le bouton « Supprimer ». Cette suppression ne peut
        survenir que pour 3 motifs :
      </p>
      <ul className='list-disc mb-8 ml-8'>
        <li>L’usager est sorti du dispositif « CEJ » ;</li>
        <li>L’usager est radié du dispositif « CEJ » ;</li>
        <li>Un autre compte existe ou va être créé.</li>
      </ul>
      <p className='mb-4'>
        Un message est envoyé à l’Usager pour le prévenir de la suppression du
        compte et des modalités pour avoir accès à ses informations et données à
        caractère personnel relatives à l’application. Pour ce faire chaque
        Usager devra envoyer un mail à l’adresse indiquée dans le mail en
        précisant son nom, son prénom et l’adresse e-mail utilisée pour la
        réception du mail de suppression.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 5 – Responsabilités
      </h2>
      <h3 className='text-base-bold text-content_color mb-2'>5.1 L’éditeur</h3>
      <p className='mb-4'>
        Les sources des informations diffusées sur la Plateforme sont réputées
        fiables mais le site ne garantit pas qu’il soit exempt de défauts,
        d’erreurs ou d’omissions.
      </p>
      <p className='mb-4'>
        L’éditeur s’autorise à suspendre ou révoquer n’importe quel compte et
        toutes les actions réalisées par ce biais, s’il estime que l’usage
        réalisé du service porte préjudice à son image ou ne correspond pas aux
        exigences de sécurité.
      </p>
      <p className='mb-4'>
        L’éditeur s’engage à la sécurisation de la Plateforme, notamment en
        prenant toutes les mesures nécessaires permettant de garantir la
        sécurité et la confidentialité des informations fournies.
      </p>
      <p className='mb-4'>
        L’éditeur fournit les moyens nécessaires et raisonnables pour assurer un
        accès continu, sans contrepartie financière, à la Plateforme. Il se
        réserve la liberté de faire évoluer, de modifier ou de suspendre, sans
        préavis, la plateforme pour des raisons de maintenance ou pour tout
        autre motif jugé nécessaire.
      </p>

      <h3 className='text-base-bold text-content_color mb-2'>
        5.2 Le Conseiller
      </h3>
      <p className='mb-4'>
        Toute information transmise par le Conseiller est de sa seule
        responsabilité. Il est rappelé que toute personne procédant à une fausse
        déclaration pour elle-même ou pour autrui s’expose, notamment, aux
        sanctions prévues à l’article 441-1 du code pénal, prévoyant des peines
        pouvant aller jusqu’à trois ans d’emprisonnement et 45 000 euros
        d’amende.
      </p>
      <p className='mb-4'>
        Le Conseiller s’engage à ne pas mettre en ligne de contenus ou
        informations contraires aux dispositions légales et réglementaires en
        vigueur. En particulier, il s’engage à ne pas publier de message
        racistes, sexistes, injurieux, insultants ou contraires à l’ordre
        public, et à ne pas télécharger de documents contenant des données à
        caractère personnel sur un système non sécurisé.
      </p>
      <p className='mb-4'>
        Toute question ou propos peut être supprimé s’il contrevient à une
        disposition des présentes CGU, s’il est contraire à des dispositions
        légales ou pour n’importe quelle raison jugée opportune par l’équipe de
        la plateforme, et ce, sans préavis.
      </p>

      <h3 className='text-base-bold text-content_color mb-2'>
        5.3 Le Superviseur
      </h3>
      <p className='mb-4'>
        Toute information transmise par le Superviseur est de sa seule
        responsabilité. Il est rappelé que toute personne procédant à une fausse
        déclaration pour elle-même ou pour autrui s’expose, notamment, aux
        sanctions prévues à l’article 441-1 du code pénal, prévoyant des peines
        pouvant aller jusqu’à trois ans d’emprisonnement et 45 000 euros
        d’amende.
      </p>
      <p className='mb-4'>Le Superviseur s’engage à ne pas :</p>
      <ul className='list-disc mb-8 ml-8'>
        <li>
          ne pas prendre de décision discriminatoire ou manifestement infondée ;
        </li>
        <li>
          mettre en ligne de contenus ou informations contraires aux
          dispositions légales et réglementaires en vigueur, en particulier à ne
          pas publier de message racistes, sexistes, injurieux, insultants ou
          contraires à l’ordre public ;
        </li>
      </ul>
      <p className='mb-4'>
        Toute question ou propos peut être supprimé s’il contrevient à une
        disposition des présentes CGU, s’il est contraire à des dispositions
        légales ou pour n’importe quelle raison jugée opportune par l’équipe de
        la plateforme, et ce, sans préavis.
      </p>

      <h3 className='text-base-bold text-content_color mb-2'>5.4 L’Usager</h3>
      <p className='mb-4'>
        Toute information transmise par l’Usager est de sa seule responsabilité.
        Il est rappelé que toute personne procédant à une fausse déclaration
        pour elle-même ou pour autrui s’expose, notamment, aux sanctions prévues
        à l’article 441-1 du code pénal, prévoyant des peines pouvant aller
        jusqu’à trois ans d’emprisonnement et 45 000 euros d’amende.
      </p>
      <p className='mb-4'>
        L’Usager s’engage à ne pas mettre en ligne de contenus ou informations
        contraires aux dispositions légales et réglementaires en vigueur. En
        particulier, l’Utilisateur s’engage à ne pas publier dans le champ libre
        de question, de message racistes, sexistes, injurieux, insultants ou
        contraires à l’ordre public.
      </p>
      <p className='mb-4'>
        Les pièces jointes déposées par l’Usager ne contiennent pas de données
        sensibles dès lors qu’elles ne sont pas strictement nécessaires à
        l’accompagnement réalisé, particulièrement des données relatives à ses
        opinions philosophiques, politiques, à sa religion, à sa santé ou à son
        orientation sexuelle ou sur sa vie sexuelle.
      </p>
      <p className='mb-4'>
        Toute question ou propos peut être supprimé s’il contrevient à une
        disposition des présentes CGU, s’il est contraire à des dispositions
        légales ou pour n’importe quelle raison jugée opportune par l’équipe de
        la plateforme, et ce, sans préavis.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 6 – Mise à jour des conditions d’utilisation
      </h2>
      <p className='mb-4'>
        Les termes des CGU doivent être acceptés au moment de la connexion.
        Toute modification des CGU réalisée en fonction des modifications
        apportées au site, de l’évolution de la législation ou pour tout autre
        motif jugé nécessaire, nécessite votre consentement.
      </p>
    </>
  )
}
