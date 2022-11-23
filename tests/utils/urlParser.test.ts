import { deleteQueryParams, parseUrl, setQueryParams } from 'utils/urlParser'

describe('urlParser', () => {
  describe('parseUrl', () => {
    it('renvoie le chemin complet (avec origine)', () => {
      // When
      const result = parseUrl('http://pass-emploi.fr/mes-jeunes')

      // Then
      expect(result).toEqual({
        baseUrl: 'http://pass-emploi.fr/mes-jeunes',
        query: {},
      })
    })

    it('renvoie le chemin complet et la requête', () => {
      // When
      const result = parseUrl('/mes-jeunes?action=succes')

      // Then
      expect(result).toEqual({
        baseUrl: '/mes-jeunes',
        query: { action: 'succes' },
      })
    })

    it('renvoie la requête avec plusieurs paramètres', () => {
      // When
      const result = parseUrl('/mes-jeunes?action=succes&filtre=valeur')

      // Then
      expect(result).toEqual({
        baseUrl: '/mes-jeunes',
        query: { action: 'succes', filtre: 'valeur' },
      })
    })

    it('renvoie la requête avec des paramètres qui sont des listes', () => {
      // When
      const result = parseUrl(
        '/mes-jeunes?action=succes&filtre=valeur&filtre=autreValeur'
      )

      // Then
      expect(result).toEqual({
        baseUrl: '/mes-jeunes',
        query: { action: 'succes', filtre: ['valeur', 'autreValeur'] },
      })
    })

    it('renvoie la requête des paramètres qui sont des grandes listes', () => {
      // When
      const result = parseUrl(
        '/mes-jeunes?action=succes&filtre=valeur&filtre=autreValeur&filtre=troisiemeValeur'
      )

      // Then
      expect(result).toEqual({
        baseUrl: '/mes-jeunes',
        query: {
          action: 'succes',
          filtre: ['valeur', 'autreValeur', 'troisiemeValeur'],
        },
      })
    })
  })

  describe('setQueryParams', () => {
    it('ajoute un paramètre à la requête', () => {
      // When
      const query = setQueryParams({ cle: 'valeur' }, { nouveau: 'param' })

      // Then
      expect(query).toEqual({ cle: 'valeur', nouveau: 'param' })
    })

    it('ajoute plusieurs paramètres à la requête', () => {
      // When
      const query = setQueryParams(
        { cle: 'valeur' },
        { nouveau: 'param', liste: ['val1', 'val2', 'val3'] }
      )

      // Then
      expect(query).toEqual({
        cle: 'valeur',
        nouveau: 'param',
        liste: ['val1', 'val2', 'val3'],
      })
    })

    it('écrase les paramètres existants', () => {
      // When
      const query = setQueryParams(
        { cle: 'valeur', liste: ['val1', 'val2', 'val3'] },
        { cle: 'nouvelleValeur', liste: ['new4', 'new5'] }
      )

      // Then
      expect(query).toEqual({
        cle: 'nouvelleValeur',
        liste: ['new4', 'new5'],
      })
    })
  })

  describe('deleteQueryParams', () => {
    it('supprime un paramètre de la requête', () => {
      // When
      const query = deleteQueryParams(
        { cle: 'valeur', obsolete: 'à supprimer' },
        ['obsolete']
      )

      // Then
      expect(query).toEqual({
        cle: 'valeur',
      })
    })

    it('supprime plusieurs paramètres de la requête', () => {
      // When
      const query = deleteQueryParams(
        { cle: 'valeur', obsolete: 'à supprimer', old: 'au revoir' },
        ['obsolete', 'old']
      )

      // Then
      expect(query).toEqual({
        cle: 'valeur',
      })
    })

    it('ignore les paramètres inexistants', () => {
      // When
      const query = deleteQueryParams(
        { cle: 'valeur', obsolete: 'à supprimer' },
        ['obsolete', 'old']
      )

      // Then
      expect(query).toEqual({
        cle: 'valeur',
      })
    })
  })
})
