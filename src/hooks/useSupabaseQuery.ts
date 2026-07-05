import { useCallback, useEffect, useState } from 'react'

interface QueryResult<T> {
  data: T | null
  error: { message: string } | null
}

export function useSupabaseQuery<T>(queryFn: () => PromiseLike<QueryResult<T>>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await queryFn()
    if (error) setError(error.message)
    else setData(data)
    setLoading(false)
    // eslint-disable-next-line
  }, deps)

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
