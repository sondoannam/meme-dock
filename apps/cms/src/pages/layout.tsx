import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

export function Component() {
  return (
    <Suspense fallback={undefined}>
      <Outlet />
    </Suspense>
  )
}
