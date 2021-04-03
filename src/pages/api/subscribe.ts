import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import { stripe } from '../../services/stripe'

import { fauna } from '../../services/fauna'
import { query as q } from 'faunadb'

type User = {
  ref: {
    id: string
  }
  data: {
    email: string
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })

    // check if customer exists on faunaDb
    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email)))
    )

    let customerId = user.data.stripe_customer_id

    if (!customerId) {
      // create stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email
        // metadata
      })

      // save customer do faunaDb
      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id
          }
        })
      )

      customerId = stripeCustomer.id
    }

    // create stripe checkout
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{ price: 'price_1Ib5V2IePKUqusNGIK4tGrjz', quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}
