## Configuration

Créez un nouveau fichier à la racine du projet et nommez le `.env.local`. Copiez ensuite le contenu du fichier
`.env.example.local` et collez le dans votre nouveau fichier.

Allez sur l'application scalingo et choississez `pa-front-staging > Environment > switch to bulk edit`. Copiez tout le
contenu pour le mettre dans le fichier `.env.local`

## Lancement

Installez et utilisez la bonne version de node et de yarn

```bash
nvm install
npm install --global yarn
```

Installez ensuite les dépendances:

```bash
yarn
```

Enfin, lancez le serveur de dev:

```bash
yarn dev
```

Voilà! Ouvrez [http://localhost:3000](http://localhost:3000) sur votre navigateur.

## Déploiement

Nous utilisons actuellement Scalingo comme hébergeur sur l'application Web. Il existe deux environnements : Staging &
Prod

### Environnement de staging

L'environnement de staging front correspond à l'application scalingo front `pa-front-staging`.

Cette application est branchée sur la branche `develop` du repo.
À chaque nouveau commit sur cette branche, un déploiement automatique sera lancé sur l'application.

Il est également possible de déployer manuellement en allant sur
`pa-front-staging > Deploy > Manual deployments > Trigger deployment`

Les review apps sont activés sur cet environnement. Donc, à chaque nouvelle PR sur develop, une application temporaire
au nom `pa-front-staging-pr[numéro de la PR sur github]` sera automatiquement créée. Cette application sera
automatiquement détruite au merge de la PR.
Pour plus d'informations sur les review apps, vous pouvez
voir [la doc scalingo](https://doc.scalingo.com/platform/app/review-apps)

### Environnement de prod

L'environnement de prod front correspond à l'application scalingo front `pa-front-prod`.

Cette application est branchée sur la branche `master` du repo.
À chaque nouveau commit sur cette branche, un déploiement automatique sera lancé sur l'application.

Il est également possible de déployer manuellement en allant sur
`pa-front-prod > Deploy > Manual deployments > Trigger deployment`

Les review apps ne sont pas activés sur la prod.
