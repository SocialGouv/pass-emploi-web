import React from 'react'

import InformationMessage from 'components/ui/Notifications/InformationMessage'

export default function ContenuCGUConseillerPassEmploi() {
  return (
    <>
      <InformationMessage label='Nous mettons à jour nos conditions générales d’utilisation. Veuillez les lire, cochez la case et valider pour pouvoir continuer à utiliser l’application.' />
      <p className='my-8'>
        Les présentes conditions générales d’utilisation (dites « CGU ») fixent
        le cadre juridique de la Plateforme « pass emploi » et définissent les
        conditions d’accès et d’utilisation des services par l’Utilisateur.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 1 – Champ d’application
      </h2>
      <p className='mb-4'>
        Tout Conseiller qui accompagne les Usagers peut créer un compte sur la
        plateforme « pass emploi » et utiliser l’application pour accompagner
        l’Usager dans sa recherche, pour trouver des ressources ou dans son
        projet professionnel en général.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>Article 2 – Objet</h2>
      <p className='mb-4'>
        La plateforme « pass emploi » a pour objet de contribuer à l’insertion
        professionnelle des Usagers. En ce sens, elle cherche à améliorer la
        mise en relation des Usagers et de leur Conseiller, force de proposition
        d’actions et conseils aux Usagers.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 3 – Définitions
      </h2>
      <p className='mb-4'>
        « Le Conseiller » est tout agent de France Travail ou d’un conseil
        départemental utilisant le back office « pass emploi », accompagnant les
        bénéficiaires du RSA dans leur recherche professionnelle, ou dans la
        création de leur projet. Il peut également s’agir de tout agent de
        France travail utilisant le back office « pass emploi », accompagnant
        les bénéficiaires de l’AIJ, de l’Accompagnement global, de
        l’Accompagnement REN-Intensif ou d’Equi’emploi / Equip’recrut.
      </p>
      <p className='mb-4'>
        « Le bénéficiaire de l’AIJ » est toute personne bénéficiant d’un AIJ
        dans les conditions prévues par l’article L. 5131-3 du Code du travail.
      </p>
      <p className='mb-4'>
        « Le bénéficiaire du RSA » est toute personne du RSA dans les conditions
        prévues aux articles L. 262-1 et suivants du code de l’action sociale et
        des familles.
      </p>
      <p className='mb-4'>
        « Le bénéficiaire de l’Accompagnement global » est toute personne
        bénéficiant d’un accompagnement global dans les conditions prévues par
        la réglementation en vigueur.
      </p>
      <p className='mb-4'>
        « Le bénéficiaire de l’Accompagnement REN-Intensif » est toute personne
        bénéficiant d’un accompagnement global dans les conditions prévues par
        la réglementation en vigueur.
      </p>
      <p className='mb-4'>
        « Le bénéficiaire de l’Accompagnement d’Equip’emploi / Equip’recrut »
        est toute personne bénéficiant d’un accompagnement global dans les
        conditions prévues par la réglementation en vigueur.
      </p>
      <p className='mb-4'>
        « L’Usager » est toute personne bénéficiaire de l’AIJ, du RSA, de
        l’Accompagnement global, de l’Accompagnement REN-Intensif et du
        dispositif Equip’emploi / Equip’recrut s’étant créé un compte,
        accompagnée dans sa recherche par un Conseiller, souhaitant trouver des
        ressources et être accompagnée dans son projet professionnel en général.
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
        l’affectation d’un Usager à un Conseiller déterminé.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.1 L’authentification
      </h3>
      <p className='mb-4'>
        Pour les conseillers de France Travail l’authentification se fait via
        les identifiants métier France Travail (système « PEAMA ») : le DGASI et
        un mot de passe. Par ailleurs ces Conseillers pourront ajouter le numéro
        France Travail des Usagers suivis.
      </p>
      <p className='mb-4'>
        Pour les conseillers des conseils départementaux, l’authentification se
        fait suite à la création d’un compte sur le back office de l’application
        pass emploi. La création d’un compte conseiller nécessite de communiquer
        une adresse de courriel valide à l’équipe de l’application pass emploi.
        Le compte conseiller sera créé sur la base de cette adresse mail. Le
        conseiller devra ensuite activer son compte en modifiant le mot de passe
        temporaire pour en créer un nouveau.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.2 Création et gestion des démarches possibles
      </h3>
      <p className='mb-4'>
        Pour les conseillers France travail uniquement, la création des
        démarches via se fait via l’outil mis à disposition par « France Travail
        » sur MAP. L’ensemble des démarches créées sont visibles par le
        bénéficiaire via son application mobile.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.3 Prise et organisation de rendez-vous
      </h3>
      <p className='mb-4'>
        Les Conseillers de France Travail peuvent prendre des rendez-vous avec
        des Usagers et en choisir les modalités (nom de l’Usager, date du
        rendez-vous, modalités de contact, notes spécifiques à communiquer) via
        leurs outils métier. Ces rendez-vous seront visibles sur l’application
        de l’Usager. Le rendez-vous mentionne toujours la date, l’horaire, le
        lieu et le moyen de contact. Ils peuvent rechercher un Usager avec
        lequel ils ont un rendez-vous et supprimer des rendez-vous directement.
        Cette action sera notifiée à l’Usager.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.4 Réception de notifications
      </h3>
      <p className='mb-4'>
        Les Conseillers peuvent recevoir des notifications dès lors qu’un Usager
        a interagi avec eux, en leur envoyant un message via le chat.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.5 Ouvrir un chat de discussion direct
      </h3>
      <p className='mb-4'>
        Chaque Conseiller peut rechercher un Usager dont il a la charge et
        échanger avec lui sur les sujets qui le concernent via un chat.
        Réciproquement, les Usagers peuvent entrer en discussion directement
        avec leur Conseiller.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.6 Organisation des affectations
      </h3>
      <p className='mb-4'>
        Les profils Superviseurs peuvent visualiser l’ensemble des « Profil
        Conseiller » sous leur supervision, ainsi que les profils « Usagers »
        qu’ils gèrent. Ils peuvent modifier l’affectation d’un Usager via une
        fonctionnalité qui leur est propre. Le changement d’affectation d’un
        Usager doit donner lieu à une affectation à un autre Conseiller.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.7 Autres fonctionnalités
      </h3>
      <p className='mb-4'>
        D’autres fonctionnalités sont ouvertes aux Conseillers. Certaines
        fonctionnalités dépendent des catégories de comptes :
      </p>
      <ul className='list-disc mb-8 ml-8'>
        <li>
          Si l’Usager ne l’a pas refusé, tous les Conseillers peuvent visualiser
          les offres et recherches sauvegardées ;
        </li>
        <li>
          Tous les Conseillers ont accès à un bouton « Actualités » leur
          présentant les nouveautés de l’application ;
        </li>
        <li>Envoyer des pièces jointes ouvrables par les Usagers.</li>
      </ul>

      <h3 className='text-base-bold text-content-color mb-2'>
        4.8 Suppressions du compte
      </h3>
      <h4 className='mb-2 mt-2 text-s-bold text-accent-2'>
        A – Suppression par l’Usager
      </h4>
      <p className='mb-4'>
        Les Usagers peuvent supprimer leur compte sur l’application à tout
        moment en cliquant sur le bouton « Supprimer ».
      </p>
      <p className='mb-4'>
        Ses démarches et ses rendez-vous (uniquement s’il est suivi par un
        conseiller de France Travail) seront toutefois conservés dans l’outil
        France Travail.
      </p>
      <h4 className='mb-2 mt-2 text-s-bold text-accent-2'>
        B – Suppression par le Conseiller
      </h4>
      <p className='mb-4'>
        Les Conseillers peuvent supprimer le compte d’un Usager qu’il suit en
        cliquant sur le bouton « Supprimer ». Cette suppression ne peut survenir
        que pour 3 motifs :
      </p>
      <ul className='list-disc mb-8 ml-8'>
        <li>L’usager est sorti du dispositif « pass emploi » ;</li>
        <li>L’usager est radié du dispositif « pass emploi » ;</li>
        <li>Un autre compte existe ou va être créé.</li>
      </ul>
      <p className='mb-4'>
        Un message est envoyé à l’Usager pour le prévenir de la suppression du
        compte et des modalités pour avoir accès à ses informations et données à
        caractère personnel relatives à l’application. Pour ce faire, chaque
        Usager devra envoyer un mail à l’adresse indiquée dans le mail en
        précisant son nom, son prénom et l’adresse e-mail utilisée pour la
        réception du mail de suppression.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 5 – Responsabilités
      </h2>
      <h3 className='text-base-bold text-content-color mb-2'>5.1 L’éditeur</h3>
      <p className='mb-4'>
        France Travail a qualité d’éditeur de l’application « pass emploi ».
      </p>
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
        sécurité et la confidentialité des informations fournies. Les échanges
        sur la plateforme entre l’Usager et son Conseiller sont chiffrés.
      </p>
      <p className='mb-4'>
        L’éditeur fournit les moyens nécessaires et raisonnables pour assurer un
        accès continu, sans contrepartie financière, à la Plateforme. Il se
        réserve la liberté de faire évoluer, de modifier ou de suspendre, sans
        préavis, la plateforme pour des raisons de maintenance ou pour tout
        autre motif jugé nécessaire.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
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
        Il doit également supprimer le compte d’un Usager pour l’un des trois
        motifs suivants :
      </p>
      <ul className='list-disc mb-8 ml-8'>
        <li>L’usager est sorti du dispositif « pass emploi » ;</li>
        <li>L’usager est radié du dispositif « pass emploi » ;</li>
        <li>Un autre compte existe ou va être créé.</li>
      </ul>
      <p className='mb-4'>
        Toute question ou propos peut être supprimé s’il contrevient à une
        disposition des présentes CGU, s’il est contraire à des dispositions
        légales ou pour n’importe quelle raison jugée opportune par l’équipe de
        la plateforme, et ce, sans préavis.
      </p>

      <h3 className='text-base-bold text-content-color mb-2'>
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
        <li>prendre de décision discriminatoire ou manifestement infondée ;</li>
        <li>
          mettre en ligne de contenus ou informations contraires aux
          dispositions légales et réglementaires en vigueur, en particulier à ne
          pas publier de message racistes, sexistes, injurieux, insultants ou
          contraires à l’ordre public.
        </li>
      </ul>
      <p className='mb-4'>
        Le Superviseur doit notamment s’assurer que le Conseiller respecte ses
        obligations au titre de l’article 5.2 des présentes CGU.
      </p>
      <p className='mb-4'>
        Toute question ou propos peut être supprimé s’il contrevient à une
        disposition des présentes CGU, s’il est contraire à des dispositions
        légales ou pour n’importe quelle raison jugée opportune par l’équipe de
        la plateforme, et ce, sans préavis.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 6 – Suspension de compte
      </h2>
      <p className='mb-4'>
        Toute suspicion de fraude, ou de violation des présentes conditions
        générales d’utilisation, notamment l’article 5 peut entraîner la
        suspension du compte, pour un temps de 8 mois maximum, après
        communication de la décision dans les conditions du présent article et
        des normes en vigueur relatives aux décisions administratives.
      </p>
      <p className='mb-4'>
        Le Conseiller s’engage à ne pas usurper l’identité d’un tiers, par
        quelques moyens que ce soit, mais particulièrement en utilisant ses
        accès, ses données ou des informations qu’il aurait en sa possession.
      </p>
      <p className='mb-4'>
        Toute suspicion d’usurpation d’identité peut entraîner une décision de
        suspension du compte et de toutes les actions associées.
      </p>
      <p className='mb-4'>
        L’éditeur transmet à la hiérarchie du conseiller et à celui-ci le
        contenu litigieux ayant conduit à la suspension du compte ou le cas
        échéant l’ouverture de la procédure de sanction et lui précise les
        motifs de la décision prévue. Le conseiller mis en cause dispose d’un
        délai de 15 jours pour apporter le contradictoire via le téléservice.
        Dans le cas où le contenu est transmis sans ouverture de procédure de
        sanction, il revient à l’organisme du conseiller de prendre les mesures
        disciplinaires correspondantes.
      </p>
      <p className='mb-4'>
        A l’issue de ce délai, l’éditeur communique sa décision ou la poursuite
        de la procédure par la hiérarchie du conseiller via le téléservice dans
        un délai raisonnable. La décision comprend les motifs de la décision et
        précise les faits reprochés. Il informe, conformément aux dispositions
        en vigueur, les délais et voies de recours. Il désactive tout accès au
        compte immédiatement à la suite de la décision.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 7 – Propriété intellectuelle
      </h2>
      <p className='mb-4'>
        La Plateforme et tous les éléments qui le composent notamment les
        programmes, données, textes, images, sons, dessins, graphismes etc. sont
        la propriété de France Travail ou font l’objet d’une concession accordée
        à son profit. Toute copie, reproduction, représentation, adaptation,
        diffusion, intégrale ou partielle de la Plateforme, par quelque procédé
        que ce soit et sur quelque support que ce soit est soumise à l’accord
        préalable écrit de France Travail, sous réserve des exceptions prévues
        par le Code de propriété intellectuelle.
      </p>
      <p className='mb-4'>
        Toute utilisation non autorisée des contenus ou informations de la
        Plateforme “pass emploi”, notamment à des fins d’exploitation
        commerciale, pourra faire l’objet de poursuites sur la base d’une action
        en contrefaçon et/ou d’une action en concurrence déloyale et/ou
        parasitisme de la part de France Travail.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 8 – Protection des données personnelles
      </h2>
      <p className='mb-4'>
        Les données à caractère personnel sont traitées par France Travail et
        les utilisateurs dans le respect des dispositions de la Loi n° 78-17 du
        6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés,
        dans sa version en vigueur, ainsi qu’au Règlement Général sur les
        Données Personnelles (RGPD).
      </p>
      <p className='mb-4'>
        Conformément à l’article L322-2 du code entre le public et
        l’administration, la réutilisation éventuelle d’informations publiques
        comportant des données à caractère personnel est subordonnée au respect
        des dispositions de la loi n° 78-17 du 6 janvier 1978 relative à
        l’informatique, aux fichiers et aux libertés.
      </p>
      <p className='mb-4'>
        L’Utilisateur s’engage à ne faire figurer aucune donnée sensible ou
        perçue comme sensible au sens de l’article 9 et 10 du RGPD qui ne
        seraient pas nécessaires au traitement.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 9 – Droit applicable et attribution de compétence
      </h2>
      <p className='mb-4'>
        Les Conditions Générales d’Utilisation sont régies par le droit
        français. Toute difficulté relative à la validité, l’application ou
        l’interprétation des Conditions Générales d’Utilisation seront soumises,
        à défaut d’accord amiable, à la compétence du Tribunal Administratif de
        Paris, auquel les parties attribuent compétence territoriale, quel que
        soit le lieu d’exécution de la Plateforme ou le domicile du défendeur.
        Cette attribution de compétence s’applique également en cas de procédure
        en référé, de pluralité de défendeurs ou d’appel en garantie.
      </p>

      <h2 className='text-m-bold text-primary mt-10 mb-4'>
        Article 10 – Mise à jour des conditions d’utilisation
      </h2>
      <p className='mb-4'>
        Les termes des CGU doivent être acceptés au moment de la connexion.
        Toute modification des CGU réalisée en fonction des modifications
        apportées à l’application, de l’évolution de la législation ou pour tout
        autre motif jugé nécessaire, nécessite votre consentement.
      </p>
    </>
  )
}
