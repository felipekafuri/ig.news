import { AppProps } from 'next/app'
import { Header } from '../components/Header'
import '../styles/global.scss'
import { Provider as NextAuthProvider } from 'next-auth/client'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  // Esse session={pageProps.session} faz com que mesmo com f5 a sessions se mantenham
  return (
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  )
}

export default MyApp
