"use client"

import { RecoilRoot } from "recoil"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return <RecoilRoot>{children}</RecoilRoot>
}
