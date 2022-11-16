import { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'
import { DateTime } from 'luxon'

import { docSnapshotToMessage, FirebaseMessage } from 'clients/firebase.client'
import { Message, TypeMessage } from 'interfaces/message'
import { TypeOffre } from 'interfaces/offre'

describe('FirebaseClient', () => {
  describe('docSnapshotToMessage', () => {
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
      const message = docSnapshotToMessage(docSnapshot)

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
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
      const message = docSnapshotToMessage(docSnapshot)

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
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
      const message = docSnapshotToMessage(docSnapshot)

      // Then
      const expectedMessage: Message = {
        id: 'document-id',
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
  })
})
