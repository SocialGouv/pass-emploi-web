import ProgressBar from '@badrap/bar-of-progress'

import Router, { useRouter } from 'next/router'
import type { AppProps } from 'next/app'
import Script from 'next/script'

import Layout from 'components/layouts/Layout'

import * as gtag from 'utils/analytics'

import 'styles/globals.css'
import 'styles/typography.css'
import { useEffect } from 'react'

const progress = new ProgressBar({
	size: 5,
	color: '#9196C0',
	className: 'bar-of-progress',
	delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()
	const isLoginPage = router.pathname === '/login'

	useEffect(() => {
		const handleRouteChange = (url: URL) => {
			gtag.pageview(url)
		}
		//When the component is mounted, subscribe to router changes
		//and log those page views
		router.events.on('routeChangeComplete', handleRouteChange)

		// If the component is unmounted, unsubscribe
		// from the event with the `off` method
		return () => {
			router.events.off('routeChangeComplete', handleRouteChange)
		}
	}, [router.events])

	return (
		<>
			{/* Global Site Tag (gtag.js) - Google Analytics */}
			<Script
				strategy='afterInteractive'
				src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
			/>
			<Script
				id='gtag-init'
				strategy='afterInteractive'
				dangerouslySetInnerHTML={{
					__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
				}}
			/>

			{isLoginPage ? (
				<Component {...pageProps} />
			) : (
				<Layout>
					<Component {...pageProps} />
				</Layout>
			)}
		</>
	)
}
export default MyApp
