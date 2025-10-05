import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'
import { signIn } from './actions'

export default async function LoginPage() {
  const session = await getSession()

  // If already logged in, redirect to home
  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <LoginForm onSubmit={signIn} />
    </div>
  )
}
