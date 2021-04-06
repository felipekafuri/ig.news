import { Session } from 'next-auth'
import { useSession, signIn } from 'next-auth/client'
import { useRouter } from 'next/dist/client/router'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'
import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

interface UserSubscriptionSession extends Session {
  activeSubscription?: any
}

type SessionProps = [UserSubscriptionSession, boolean]

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const [session]: SessionProps = useSession()
  const router = useRouter()

  async function handleSubscribe() {
    if (!session) {
      signIn('github')
      return
    }

    if (session?.activeSubscription) {
      router.push('/posts')
      return
    }

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data

      const stripe = await getStripeJs()

      await stripe.redirectToCheckout({ sessionId })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <button className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  )
}
