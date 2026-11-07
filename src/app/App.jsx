import { AppProviders } from './providers'
import { AppRoutes } from './AppRoutes'

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

export default App
