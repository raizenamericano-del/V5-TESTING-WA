'use client'

import { SWRConfig } from 'swr'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
import { fetcher } from '@/lib/fetcher'
import { SocketProvider } from '@/hooks/use-socket'
import { NotificationCenter } from '@/components/notification-center'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        keepPreviousData: true,
      }}
    >
      <SocketProvider>
        {!pathname?.startsWith('/login') && <NotificationCenter />}
        {children}
        <Toaster
          theme="light"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e1e8dc',
              backdropFilter: 'blur(14px)',
              color: '#26372a',
            },
          }}
        />
      </SocketProvider>
    </SWRConfig>
  )
}
