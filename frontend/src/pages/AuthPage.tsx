import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import BrandMark from '@/components/BrandMark'
import { errorMessage, useAuthActions, useCurrentUser } from '@/hooks/useAuth'

type Mode = 'login' | 'register'
type Rules = { minLength?: number; maxLength?: number; pattern?: string; title?: string }

const COPY: Record<Mode, { title: string; submit: string; switchTo: Mode; switchHint: string }> = {
  login: { title: '登录', submit: '登录', switchTo: 'register', switchHint: '还没有账号？注册' },
  register: {
    title: '创建账号',
    submit: '注册并进入',
    switchTo: 'login',
    switchHint: '已有账号？登录',
  },
}

// 与后端 Credentials 一致，注册时先在浏览器拦下，不用等一次请求。登录不限长度，老账号也进得来。
const RULES: Record<Mode, { username: Rules; password: Rules }> = {
  login: { username: {}, password: {} },
  register: {
    username: {
      minLength: 3,
      maxLength: 32,
      pattern: '[\\p{L}\\p{N}_]{3,32}',
      title: '3–32 位字母、数字或下划线',
    },
    password: { minLength: 6, maxLength: 64, title: '6–64 位' },
  },
}

export default function AuthPage() {
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('mode') === 'register' ? 'register' : 'login'
  const copy = COPY[mode]

  const navigate = useNavigate()
  const { user, isLoading } = useCurrentUser()
  const { login, register } = useAuthActions()
  const action = mode === 'login' ? login : register

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (!isLoading && user) return <Navigate to="/create" replace />

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    action.mutate({ username, password }, { onSuccess: () => navigate('/create', { replace: true }) })
  }

  const switchMode = () => {
    action.reset()
    setParams({ mode: copy.switchTo })
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center px-6 py-12">
      {/* 与首页同一组套印圆点，压在卡片后面 */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[520px] translate-x-[-8%] translate-y-[-62%]" aria-hidden>
        <span className="bg-accent absolute top-0 left-0 size-[360px] rounded-full opacity-70 mix-blend-multiply" />
        <span className="text-brand bg-halftone absolute top-[120px] left-[140px] size-[360px] rounded-full opacity-80 mix-blend-multiply" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="border-ink bg-paper rounded-panel shadow-card border-2 p-8">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="返回首页">
              <BrandMark size="sm">
                <span className="text-ink text-sm font-semibold">AI 修图智能体</span>
              </BrandMark>
            </Link>
            <Link to="/" className="text-faint hover:text-ink text-xs transition-colors">
              ← 首页
            </Link>
          </div>

          <h1 className="font-display text-print mt-7 text-4xl">{copy.title}</h1>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field
              label="用户名"
              value={username}
              onChange={setUsername}
              autoComplete="username"
              placeholder="3–32 位字母、数字或下划线"
              rules={RULES[mode].username}
            />
            <Field
              label="密码"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="至少 6 位"
              rules={RULES[mode].password}
            />

            {action.isError && <p className="text-danger text-sm">{errorMessage(action.error)}</p>}

            <button
              type="submit"
              disabled={action.isPending}
              className="bg-brand hover:bg-brand-strong text-paper shadow-print rounded-control w-full py-2.5 text-sm font-semibold transition-[background-color,translate] active:translate-px disabled:opacity-50 disabled:shadow-none"
            >
              {action.isPending ? '处理中…' : copy.submit}
            </button>
          </form>

          <button
            type="button"
            onClick={switchMode}
            className="text-muted hover:text-accent-strong mt-5 text-sm transition-colors"
          >
            {copy.switchHint}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  rules,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  placeholder?: string
  rules?: Rules
}) {
  return (
    <label className="block">
      <span className="text-muted mb-1.5 block text-sm">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        {...rules}
        className="border-line bg-paper text-ink placeholder:text-faint focus:border-brand rounded-control w-full border px-3.5 py-2.5 text-sm outline-none transition-colors"
      />
    </label>
  )
}
