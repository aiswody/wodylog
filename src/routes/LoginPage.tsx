import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorBanner } from '../components/common/ErrorBanner'

export function LoginPage() {
  const { session, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'signup') setSignupDone(true)
  }

  return (
    <div className="login-page">
      <h1>wodylog</h1>
      <p className="login-subtitle">취준생을 위한 지원 일정관리</p>

      <div className="login-mode-toggle">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          로그인
        </button>
        <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
          회원가입
        </button>
      </div>

      {signupDone ? (
        <p>가입 확인 메일을 확인한 뒤 로그인해주세요.</p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="login-form">
          <label>
            이메일
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <ErrorBanner message={error} />}

          <button type="submit" disabled={submitting}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      )}
    </div>
  )
}
