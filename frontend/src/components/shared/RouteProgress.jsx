import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Override default styling to match brand colors
const injectStyles = () => {
  const style = document.createElement('style')
  style.textContent = `
    #nprogress .bar {
      background: #b45309 !important;
      height: 3px !important;
    }
    #nprogress .peg {
      box-shadow: 0 0 10px #b45309, 0 0 5px #b45309 !important;
    }
    #nprogress .spinner-icon {
      border-top-color: #b45309 !important;
      border-left-color: #b45309 !important;
    }
  `
  document.head.appendChild(style)
}

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 })
injectStyles()

export default function RouteProgress() {
  const location = useLocation()

  useEffect(() => {
    NProgress.start()
    const timer = setTimeout(() => NProgress.done(), 300)
    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [location.pathname])

  return null
}
