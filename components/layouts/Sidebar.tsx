import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import styles from 'styles/components/Layouts.module.css'

import { Conseiller } from 'interfaces'
import fetchJson from 'utils/fetchJson'

import { useSession, signOut } from 'next-auth/react'

import DashboardIcon from '../../assets/icons/dashboard.svg'
import Logo from '../../assets/icons/logo_PassEmploi.svg'
import LogoutIcon from '../../assets/icons/logout.svg'
import PersonIcon from '../../assets/icons/person.svg'

type SidebarProps = {}

export default function Sidebar({}: SidebarProps) {
  const router = useRouter()

  const { data: session } = useSession()

  async function handleLogout(event: any) {
    event.preventDefault()
    signOut()
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

          <Link href={'/mes-jeunes'}>
            <a
              className={
                router.pathname.startsWith('/mes-jeunes')
                  ? styles.activeLink
                  : ''
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
        {session && (
          <p className='text-lg-semi text-bleu_nuit'>{session?.user?.name}</p>
        )}

        <Link href={'/api/logout'}>
          <a onClick={handleLogout} className='mr-[8px]'>
            <LogoutIcon
              role='img'
              focusable='false'
              aria-label='Se déconnecter'
            />
          </a>
        </Link>
      </div>
    </div>
  )
}
