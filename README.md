## Configuration

- Copier le fichier `.env.local.template` et nommez le `.env.local`.
- Demander la dotvault key à l'equipe (ou voir su vaulwarden)
- Obtenir la dernière version des vars d'env : `npx dotvault decrypt`
- Pensez à mettre à jour le fichier d'env (dans le cas d'une modification/ajout): `npx dotvault encrypt`

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
