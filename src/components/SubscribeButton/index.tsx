import { signIn, useSession } from 'next-auth/client'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'
import styles from './styles.module.scss'

interface SubscribeButton {
  priceId: string
}
export function SubscribeButton({ priceId }: SubscribeButton): JSX.Element {
  const [session] = useSession()

  async function handleSubscribe() {
    if (!session) {
      signIn('github')
    }
    // criação da checkout session

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data

      const stripe = await getStripeJs()

      await stripe.redirectToCheckout({ sessionId })
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  )
}
