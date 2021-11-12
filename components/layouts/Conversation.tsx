import { useCallback, useEffect, useRef, useState } from 'react'

import firebase from 'firebase/app'
import 'firebase/firestore'

import {
	Jeune,
	Message,
	DailyMessages,
	ListDailyMessages,
	Conseiller,
} from 'interfaces'
import {
	dateIsToday,
	formatDayDate,
	formatHourMinuteDate,
	isDateOlder,
} from 'utils/date'

import styles from 'styles/components/Layouts.module.css'

import SendIcon from '../../assets/icons/send.svg'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'
import fetchJson from 'utils/fetchJson'

const collection = process.env.FIREBASE_COLLECTION_NAME || ''

const todayOrDate = (date: Date) =>
	dateIsToday(date) ? "Aujourd'hui" : `Le ${formatDayDate(date)}`

type ConversationProps = {
	db: firebase.firestore.Firestore
	jeune: Jeune
	onBack: () => void
}

let conseillerId = '0'

export default function Conversation({ db, jeune, onBack }: ConversationProps) {
	const [newMessage, setNewMessage] = useState('')
	const [dailyMessages, setDailyMessages] = useState<DailyMessages[]>([])
	const [lastSeenByJeune, setLastSeenByJeune] = useState<Date>(new Date())

	const dummySpace = useRef<HTMLLIElement>(null)

	const updateConseillerReadingStatus = useCallback(() => {
		db.collection(collection).doc(jeune.chatId).update({
			seenByConseiller: true,
			lastConseillerReading: firebase.firestore.FieldValue.serverTimestamp(),
		})
	}, [db, jeune.chatId])

	const handleSubmit = (e: any) => {
		e.preventDefault()

		const firestoreNow = firebase.firestore.FieldValue.serverTimestamp()

		db.collection(collection).doc(jeune.chatId).collection('messages').add({
			content: newMessage,
			creationDate: firestoreNow,
			sentBy: 'conseiller',
		})

		db.collection(collection)
			.doc(jeune.chatId)
			.update({
				seenByConseiller: true,
				newConseillerMessageCount: firebase.firestore.FieldValue.increment(1),
				lastMessageContent: newMessage,
				lastMessageSentAt: firestoreNow,
				lastMessageSentBy: 'conseiller',
			})

		updateConseillerReadingStatus()

		/**
		 * Route send from web to notify mobile, no need to await for response
		 */
		fetch(
			`${process.env.API_ENDPOINT}/conseillers/${conseillerId}/jeunes/${jeune.id}/notify-message`,
			{
				method: 'POST',
			}
		).catch(function (error) {
			console.error('Conversation: Error while fetching /notify-message', error)
		})

		setNewMessage('')

		if (dummySpace && dummySpace.current) {
			dummySpace.current.scrollIntoView({ block: 'end', inline: 'nearest' })
		}
	}

	// automatically check db for new messages
	useEffect(() => {
		let currentMessages: Message[]

		const messagesUpdatedEvent = db
			.collection(collection)
			.doc(jeune.chatId)
			.collection('messages')
			.orderBy('creationDate')
			.onSnapshot((querySnapShot: any) => {
				// get all documents from collection with id
				const data = querySnapShot.docs.map((doc: any) => ({
					...doc.data(),
					id: doc.id,
				}))

				currentMessages = [...data]

				if (
					!currentMessages ||
					!currentMessages[currentMessages.length - 1]?.creationDate
				) {
					return
				}

				setDailyMessages(new ListDailyMessages(currentMessages).dailyMessages)
			})

		updateConseillerReadingStatus()

		return () => {
			// unsubscribe
			messagesUpdatedEvent()
		}
	}, [db, jeune.chatId, updateConseillerReadingStatus])

	useEffect(() => {
		async function updateReadingStatus() {
			db.collection(collection)
				.doc(jeune.chatId)
				.onSnapshot((docSnapshot) => {
					setLastSeenByJeune(docSnapshot.data()?.lastJeuneReading.toDate())
				})
		}

		updateReadingStatus()
	}, [db, jeune.chatId])

	useEffect(() => {
		async function fetchConseiller(): Promise<Conseiller> {
			return await fetchJson('/api/user')
		}

		fetchConseiller().then((conseiller) => {
			conseillerId = conseiller.id
		})
	}, [])

	return (
		<div className={styles.conversationConainer}>
			<div className={styles.conversationTitleConainer}>
				<button onClick={onBack}>
					<ChevronLeftIcon
						role='img'
						focusable='false'
						aria-label='Retour sur ma messagerie'
					/>
				</button>
				<h2 className='h2-semi'>Discuter avec {jeune.firstName}</h2>
			</div>

			<ul className={styles.messages}>
				{dailyMessages.map(
					(dailyMessage: DailyMessages, dailyIndex: number) => (
						<li key={dailyMessage.date.getTime()}>
							<div className={`text-md text-bleu ${styles.day}`}>
								<span>{todayOrDate(dailyMessage.date)}</span>
							</div>

							<ul>
								{dailyMessage.messages.map(
									(message: Message, index: number) => (
										<li key={message.id}>
											<p
												className={`text-md ${
													message.sentBy === 'conseiller'
														? styles.sentMessage
														: styles.receivedMessage
												}`}
											>
												{message.content}
											</p>
											<p
												className={`text-xs text-bleu_gris ${
													message.sentBy === 'conseiller'
														? 'text-right'
														: 'text-left'
												}`}
											>
												{formatHourMinuteDate(message.creationDate.toDate())}
												{message.sentBy === 'conseiller' && (
													<span>
														{isDateOlder(
															message.creationDate.toDate(),
															lastSeenByJeune
														)
															? ' · Lu'
															: ' · Envoyé'}
													</span>
												)}
											</p>

											{dailyIndex === dailyMessages.length - 1 &&
												index === dailyMessage.messages.length - 1 && (
													<section aria-hidden='true' ref={dummySpace} />
												)}
										</li>
									)
								)}
							</ul>
						</li>
					)
				)}
			</ul>

			<form onSubmit={handleSubmit} className={styles.form}>
				<input
					type='text'
					value={newMessage}
					className='text-md text-bleu_nuit'
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder='Écrivez votre message ici...'
				/>

				<button
					type='submit'
					disabled={!newMessage}
					className='bg-bleu_nuit w-[48px] p-[17px] rounded rounded-x_large'
				>
					<SendIcon aria-hidden='true' focusable='false' />
				</button>
			</form>
		</div>
	)
}
