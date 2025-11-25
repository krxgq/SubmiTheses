import { ReactNode } from 'react'

interface UsersLayoutProps {
  children: ReactNode
}

export default async function UsersLayout({ children }: UsersLayoutProps) {
  return <>{children}</>
}
