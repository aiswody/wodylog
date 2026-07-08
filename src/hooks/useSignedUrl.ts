import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const EXPIRES_IN_SECONDS = 60 * 10

export function useSignedUrl(bucket: string, path: string | null) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }
    let cancelled = false
    void supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, EXPIRES_IN_SECONDS)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [bucket, path])

  return url
}
