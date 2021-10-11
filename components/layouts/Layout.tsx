/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { db } from 'utils/firebase'

import Head from 'next/head'

import Sidebar from './Sidebar'
import ChatBox from './ChatRoom'

import styles from 'styles/components/Layouts.module.css'

type LayoutProps = {
	children: any
}

export default function Layout({ children }: LayoutProps) {
	return (
		<>
			<Head>
				<title>Espace conseiller Pass Emploi</title>
				<meta
					name='description'
					content="Espace conseiller de l'outil pass emploi"
				/>
				<link rel='icon' href='/favicon.png' />
				{/* TODO: what s going on with Font?
          <link
           rel="preload"
           href='/fonts/Rubik/static/Rubik-Regular.ttf'
           as="font"
           crossOrigin=""
         /> */}
			</Head>
			<div className={styles.container}>
				<Sidebar />
				<main className={styles.page} role='main'>
					{children}
				</main>
				<ChatBox db={db} />
			</div>
			<div id='modal-root'></div>
		</>
	)
}
