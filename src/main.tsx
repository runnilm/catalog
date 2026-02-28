import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const mq = window.matchMedia('(prefers-color-scheme: dark)')
const apply = (e: MediaQueryList | MediaQueryListEvent) =>
  document.documentElement.classList.toggle('dark', e.matches)
apply(mq)
mq.addEventListener('change', apply)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
