import Nav from '@/components/Nav'
export default function AppLayout({ children }) {
  return (<><Nav /><main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">{children}</main></>)
}
