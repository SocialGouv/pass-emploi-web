import ProgressBar from "@badrap/bar-of-progress";

import Router from "next/router";
import type { AppProps } from 'next/app'

import Layout from 'components/layouts/Layout'

import 'styles/globals.css'
import 'styles/typography.css'


const progress = new ProgressBar({
  size: 5,
  color: "#9196C0",
  className: "bar-of-progress",
  delay: 100,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps}/>
    </Layout>
  )
}
export default MyApp
