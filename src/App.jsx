import { Routes, Route } from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import ObservationsPage from './pages/ObservationsPage'
import ConsentsPage from './pages/ConsentsPage'
import AnalysesPage from './pages/AnalysesPage'
import StrategiesPage from './pages/StrategiesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProfilePage />} />
      <Route path="/observations" element={<ObservationsPage />} />
      <Route path="/consents" element={<ConsentsPage />} />
      <Route path="/analyses" element={<AnalysesPage />} />
      <Route path="/strategies" element={<StrategiesPage />} />
    </Routes>
  )
}

export default App
