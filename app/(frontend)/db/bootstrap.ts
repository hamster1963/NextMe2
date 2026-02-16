function isMissingSQLiteTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as { message?: unknown; cause?: unknown }
  if (
    typeof maybeError.message === 'string' &&
    maybeError.message.includes('no such table')
  ) {
    return true
  }

  return isMissingSQLiteTableError(maybeError.cause)
}

export async function isPayloadBootstrapped() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])

  const payload = await getPayload({ config })

  try {
    const users = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      pagination: false,
    })

    return Array.isArray(users.docs) && users.docs.length > 0
  } catch (error) {
    if (isMissingSQLiteTableError(error)) {
      return false
    }
    throw error
  }
}
