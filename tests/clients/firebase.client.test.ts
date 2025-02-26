import { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'
import { DateTime } from 'luxon'

import {
  chatToFirebase,
  docSnapshotToMessage,
  FirebaseMessage,
} from 'clients/firebase.client'
import { Message, TypeMessage } from 'interfaces/message'
import { TypeOffre } from 'interfaces/offre'

describe('FirebaseClient', () => {
  describe('docSnapshotToMessage', () => {
    it('mappe un message', () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cet événement',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_EVENEMENT',
          sentBy: 'jeune',
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cet événement',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_EVENEMENT,
        sentBy: 'jeune',
        iv: 'iv',
        conseillerId: 'conseiller-id',
      }
      expect(message).toEqual(expectedMessage)
    })

    it('mappe un message modifié', () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cet événement',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_EVENEMENT',
          sentBy: 'jeune',
          status: 'modified',
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cet événement',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_EVENEMENT,
        sentBy: 'jeune',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        status: 'modified',
      }
      expect(message).toEqual(expectedMessage)
    })

    it('mappe un message supprimé', () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cet événement',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_EVENEMENT',
          sentBy: 'jeune',
          status: 'deleted',
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cet événement',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_EVENEMENT,
        sentBy: 'jeune',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        status: 'deleted',
      }
      expect(message).toEqual(expectedMessage)
    })

    it("mappe un partage d'événement", () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cet événement',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_EVENEMENT',
          sentBy: 'jeune',
          evenement: {
            id: 'id-event',
            titre: 'Un événement',
            type: 'ATELIER',
            date: '2021-12-22T00:00:00.000Z',
          },
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cet événement',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_EVENEMENT,
        sentBy: 'jeune',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        infoEvenement: {
          id: 'id-event',
          titre: 'Un événement',
          date: DateTime.fromISO('2021-12-22T00:00:00.000Z'),
        },
      }
      expect(message).toEqual(expectedMessage)
    })

    it("mappe un partage d'événement d’emploi", () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cet événement emploi',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_EVENEMENT_EMPLOI',
          sentBy: 'jeune',
          evenementEmploi: {
            id: 'id-event',
            titre: 'Un événement emploi',
            type: 'MESSAGE_EVENEMENT_EMPLOI',
            url: 'http://www.lala.com',
          },
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cet événement emploi',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_EVENEMENT_EMPLOI,
        sentBy: 'jeune',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        infoEvenementEmploi: {
          id: 'id-event',
          titre: 'Un événement emploi',
          url: 'http://www.lala.com',
        },
      }
      expect(message).toEqual(expectedMessage)
    })

    it("mappe un partage d'offre", () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cette offre',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_OFFRE',
          sentBy: 'jeune',
          offre: {
            id: 'id-offre',
            titre: 'Une offre',
            type: 'EMPLOI',
          },
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cette offre',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_OFFRE,
        sentBy: 'jeune',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        infoOffre: {
          id: 'id-offre',
          titre: 'Une offre',
          type: TypeOffre.EMPLOI,
        },
      }
      expect(message).toEqual(expectedMessage)
    })

    it('mappe une pièce jointe', () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cette offre',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_PJ',
          sentBy: 'conseiller',
          piecesJointes: [
            {
              id: 'id-pj',
              nom: 'nom-pj',
            },
          ],
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cette offre',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_PJ,
        sentBy: 'conseiller',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'nom-pj',
          },
        ],
      }
      expect(message).toEqual(expectedMessage)
    })

    it('mappe une session Milo', () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cette offre',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'MESSAGE_SESSION_MILO',
          sentBy: 'conseiller',
          sessionMilo: {
            id: 'id-session-milo',
            titre: 'Le titre d’une session',
          },
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cette offre',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_SESSION_MILO,
        sentBy: 'conseiller',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        infoSessionMilo: {
          id: 'id-session-milo',
          titre: 'Le titre d’une session',
        },
      }
      expect(message).toEqual(expectedMessage)
    })

    it('mappe une autoinscription à une session Milo', () => {
      // Given
      const docSnapshot: QueryDocumentSnapshot<FirebaseMessage> = {
        id: 'document-id',
        data: () => ({
          iv: 'iv',
          conseillerId: 'conseiller-id',
          content: 'Je vous partage cette offre',
          creationDate: Timestamp.fromDate(
            DateTime.local(2022, 1, 17).toJSDate()
          ),
          type: 'AUTO_INSCRIPTION',
          sentBy: 'conseiller',
          sessionMilo: {
            id: 'id-session-milo',
            titre: 'Le titre d’une session',
          },
        }),
      } as QueryDocumentSnapshot<FirebaseMessage>

      // When
      const message = docSnapshotToMessage(docSnapshot, 'idBeneficiaire')

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
        idBeneficiaire: 'idBeneficiaire',
        content: 'Je vous partage cette offre',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.AUTO_INSCRIPTION,
        sentBy: 'conseiller',
        iv: 'iv',
        conseillerId: 'conseiller-id',
        infoSessionMilo: {
          id: 'id-session-milo',
          titre: 'Le titre d’une session',
        },
      }
      expect(message).toEqual(expectedMessage)
    })
  })

  describe('chatToFirebase', () => {
    it('map la lecture de la conversation', async () => {
      // Given
      const date = DateTime.now()

      // When
      const actual = chatToFirebase({
        seenByConseiller: true,
        lastConseillerReading: date,
      })

      // Then
      expect(actual).toEqual({
        seenByConseiller: true,
        lastConseillerReading: Timestamp.fromDate(date.toJSDate()),
      })
    })

    it('map le suivi de la conversation', async () => {
      // When
      const actual = chatToFirebase({
        flaggedByConseiller: true,
      })

      // Then
      expect(actual).toEqual({
        flaggedByConseiller: true,
      })
    })

    it('map une conversation avec un nouveau message', async () => {
      // Given
      const date = DateTime.now()

      // When
      const actual = chatToFirebase({
        lastMessageContent: 'Message chiffré',
        lastMessageIv: 'IV',
        lastMessageSentAt: date,
        lastMessageSentBy: 'conseiller',
        newConseillerMessageCount: 12,
        seenByConseiller: true,
        lastConseillerReading: date,
      })

      // Then
      expect(actual).toEqual({
        lastConseillerReading: Timestamp.fromDate(date.toJSDate()),
        lastMessageContent: 'Message chiffré',
        lastMessageIv: 'IV',
        lastMessageSentAt: Timestamp.fromDate(date.toJSDate()),
        lastMessageSentBy: 'conseiller',
        newConseillerMessageCount: 12,
        seenByConseiller: true,
      })
    })
  })
})
