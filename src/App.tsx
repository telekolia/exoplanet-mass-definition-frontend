import { Navigate, Route, Routes } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { FeedPage } from './pages/FeedPage'
import { TilePage } from './pages/TilePage'

export default function App() {
  return (
    <div className="app">
      <header className="top-header">
        <h1>Телескопная</h1>
      </header>
      <Routes>
        <Route path="/telescope-tile" element={<TilePage />} />
        <Route path="/telescope-feed" element={<FeedPage />} />
        <Route path="*" element={<Navigate to="/telescope-tile" replace />} />
      </Routes>
      <TabBar />
    </div>
  )
}
