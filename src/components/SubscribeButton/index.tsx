import styles from './styles.module.scss'

interface SubscribeButton {
  priceId: string
}
export function SubscribeButton({ priceId }: SubscribeButton): JSX.Element {
  return (
    <button type="button" className={styles.subscribeButton}>
      Subscribe Now
    </button>
  )
}
