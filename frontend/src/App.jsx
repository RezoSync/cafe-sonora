import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import './App.scss'
import { AuthProvider } from './context/AuthContext.jsx'
import Navigation from './routes'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
    </AuthProvider>
  )
}

export default App
