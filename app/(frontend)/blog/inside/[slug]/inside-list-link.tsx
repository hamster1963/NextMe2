'use client'

import Link from 'next/link'

export default function InsideListLink({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const saveSession = () => {
    sessionStorage.setItem('fromBlogPage', 'true')
  }
  return (
    <Link
      onClick={saveSession}
      className="flex flex-col space-y-2"
      href={`/blog/inside/${slug}`}
    >
      {children}
    </Link>
  )
}
