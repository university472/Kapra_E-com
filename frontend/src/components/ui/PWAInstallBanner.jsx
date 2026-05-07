import { usePWAInstall } from '../../hooks/usePWA'
import { Download, X, Smartphone } from 'lucide-react'
import { useState } from 'react'

export default function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismiss] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 left-4 right-4
                    sm:left-auto sm:right-6 sm:w-80 z-40
                    bg-white rounded-2xl shadow-xl border border-gray-100
                    p-4 flex items-center gap-3
                    animate-in slide-in-from-bottom-4 duration-400"
    >
      <div
        className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center
                      justify-center shrink-0"
      >
        <Smartphone size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900">Install Kapra Store</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Add to home screen for quick access
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={install}
          className="bg-brand-500 text-white text-xs font-bold
                     px-3 py-1.5 rounded-xl hover:bg-brand-600
                     transition-colors flex items-center gap-1"
        >
          <Download size={12} />
          Install
        </button>
        <button
          onClick={() => setDismiss(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  )
}
