import { redirect } from 'next/navigation'
import Avatar from './avatar'
import { isPayloadBootstrapped } from './db/bootstrap'
import { getSiteSettings } from './db/site-settings'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const ready = await isPayloadBootstrapped()
  if (!ready) {
    redirect('/setup')
  }

  const {
    profileName,
    profileTagline,
    introLines,
    profileAvatar,
    profileAvatarAlt,
  } = await getSiteSettings()

  return (
    <main
      className="flex min-h-[calc(100dvh-11rem)] flex-col justify-center sm:min-h-[calc(100dvh-14rem)]"
      aria-label="Personal homepage content"
    >
      <div className="-mt-4 sm:-mt-8 sm:px-28">
        <Avatar
          name={profileName}
          avatarUrl={profileAvatar}
          avatarAlt={profileAvatarAlt}
        />
        <h1 className="mb-1 font-medium text-xl tracking-tighter">
          {profileName}
        </h1>
        <p className="prose prose-neutral dark:prose-invert text-[13px]">
          {profileTagline}
        </p>
        {introLines.length > 0 ? (
          <section className={'mb-4 pt-10 font-medium text-md'}>
            {introLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  )
}
