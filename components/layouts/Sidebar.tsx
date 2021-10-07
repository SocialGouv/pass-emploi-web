import Link from 'next/link'
import { useRouter } from 'next/router'

import { useEffect, useState } from 'react'

import fetchJson from 'utils/fetchJson'

import { Conseiller } from 'interfaces'

import Logo from '../../assets/icons/logo_PassEmploi.svg'
import DashboardIcon from '../../assets/icons/dashboard.svg'
import ViewlistIcon from '../../assets/icons/view_list.svg'
import PersonIcon from '../../assets/icons/person.svg'
import LogoutIcon from '../../assets/icons/logout.svg'

import styles from 'styles/components/Layouts.module.css'
import useUser from 'utils/useUser'

type SidebarProps = {}

export default function Sidebar({}: SidebarProps) {
	const router = useRouter()

	const [conseillerName, setConseillerName] = useState<String>('')
	const { user, mutateUser } = useUser()

	useEffect(() => {
		async function fetchConseiller(): Promise<Conseiller> {
			return await fetchJson('/api/user')
		}

		fetchConseiller().then((conseiller) => {
			setConseillerName(conseiller.firstName)
		})
	}, [])

	async function handleLogout(event: any) {
		event.preventDefault()
		mutateUser(await fetchJson('/api/logout', { method: 'POST' }), false)
		router.push('/login')
	}

	return (
		<div className={styles.sidebar}>
			<div>
				<Logo
					role='img'
					focusable='false'
					className='mb-[30px] mx-auto'
					aria-label='Logo de Pass Emploi'
				/>

				<nav role='navigation' aria-label='Menu principal'>
					<Link href='/'>
						<a className={router.pathname === '/' ? styles.activeLink : ''}>
							<DashboardIcon
								role='img'
								focusable='false'
								aria-label="Aller sur la page d'accueil"
								className='mr-[8px]'
							/>
							<span className='text-xs-semi text-bleu_nuit'>
								Tableau de bord
							</span>
						</a>
					</Link>

					<Link href='/actions'>
						<a
							className={
								router.pathname.includes('/actions') ? styles.activeLink : ''
							}
						>
							<ViewlistIcon
								role='img'
								focusable='false'
								aria-label='Aller sur la liste des actions'
								className='mr-[8px]'
							/>
							<span className='text-xs-semi text-bleu_nuit text-center'>
								Actions
							</span>
						</a>
					</Link>

					<Link href='/mes-jeunes'>
						<a
							className={
								router.pathname.includes('/mes-jeunes') ? styles.activeLink : ''
							}
						>
							<PersonIcon
								role='img'
								focusable='false'
								aria-label='Aller sur la liste de mes bénéficiaires'
								className='mr-[8px]'
							/>
							<span className='text-xs-semi text-bleu_nuit text-center'>
								Mes jeunes
							</span>
						</a>
					</Link>
				</nav>
			</div>

			<div className='flex justify-between'>
				<p className='text-lg-semi text-bleu_nuit'>{conseillerName}</p>

				<a href='/api/logout' onClick={handleLogout} className='mr-[8px]'>
					<LogoutIcon
						role='img'
						focusable='false'
						aria-label='Se déconnecter'
					/>
				</a>
			</div>
		</div>
	)
}
