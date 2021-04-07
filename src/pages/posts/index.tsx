import { GetStaticProps } from 'next'
import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic'
import styles from './styles.module.scss'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import Link from 'next/link'
import { FiCalendar } from 'react-icons/fi'
import { useState } from 'react'

interface Post {
  slug: string
  title: string
  excerpt: string
  updatedAt: string
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface PostsProps {
  postsPagination: PostPagination
}

export default function Posts({ postsPagination }: PostsProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  )

  const handleLoadMore = async () => {
    const headers = new Headers()
    const init = {
      method: 'GET',
      headers
    }
    if (nextPage) {
      fetch(nextPage, init)
        .then(response => response.json())
        .then(data => {
          const newPosts = data.results.map(post => {
            return {
              slug: post.uid,
              title: RichText.asText(post.data.title),
              excerpt:
                post.data.content.find(content => content.type === 'paragraph')
                  ?.text ?? '',
              updatedAt: new Date(
                post.last_publication_date
              ).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })
            }
          })
          setPosts([...posts, ...newPosts])
          setNextPage(data.next_page)
        })
    }
  }
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/posts/preview/${post.slug}`} key={post.slug}>
              <a>
                <time>
                  <FiCalendar /> {post.updatedAt}
                </time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
          {nextPage ? (
            <button className={styles.loadMore} onClick={handleLoadMore}>
              Carregar mais posts
            </button>
          ) : (
            <></>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { fetch: ['post.title', 'post.content'], pageSize: 1 }
  )

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find(content => content.type === 'paragraph')?.text ??
        '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      )
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: response.next_page
      }
    },
    revalidate: 60 * 60 // 1 hour
  }
}
