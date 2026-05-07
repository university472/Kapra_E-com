import { useState, useEffect } from 'react'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Slider } from '../../components/ui/slider'
import { productAPI } from '../../api'
import { FABRIC_TYPES, OCCASIONS, YARDAGES } from '../../constants'

const ColorDot = ({ color, selected, onClick }) => {
  const colorMap = {
    white: '#ffffff',
    black: '#1a1a1a',
    red: '#ef4444',
    pink: '#ec4899',
    blue: '#3b82f6',
    navy: '#1e3a5f',
    green: '#22c55e',
    yellow: '#eab308',
    purple: '#a855f7',
    orange: '#f97316',
    teal: '#14b8a6',
    beige: '#d4b896',
    maroon: '#7f1d1d',
    gold: '#b45309',
    grey: '#9ca3af',
    charcoal: '#4b5563',
    brown: '#92400e',
    rust: '#b45309',
    ivory: '#fffff0',
    lilac: '#c4b5fd',
    blush: '#fda4af',
    olive: '#84cc16',
    khaki: '#a16207',
    aqua: '#06b6d4',
    mustard: '#eab308',
    camel: '#d97706'
  }

  const bg = colorMap[color?.toLowerCase()] || '#e5e7eb'

  return (
    <button
      onClick={onClick}
      title={color}
      style={{ backgroundColor: bg }}
      className={`w-7 h-7 rounded-full border-2 transition-all
                  hover:scale-110
                  ${
                    selected
                      ? 'border-brand-500 scale-110 shadow-md'
                      : 'border-white shadow-sm'
                  }`}
    />
  )
}

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  isOpen,
  onClose
}) {
  const [meta, setMeta] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [localFilters, setLocalFilters] = useState(filters)

  // Fetch filter metadata once
  useEffect(() => {
    productAPI
      .getFilterMeta()
      .then(({ data }) => {
        setMeta(data)
        setPriceRange([data.priceRange.min, data.priceRange.max])
        setLocalFilters((prev) => ({
          ...prev,
          minPrice: prev.minPrice ?? data.priceRange.min,
          maxPrice: prev.maxPrice ?? data.priceRange.max
        }))
      })
      .catch(() => {})
  }, [])

  // Sync external filter changes in
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const update = (key, value) => {
    const next = { ...localFilters, [key]: value }
    setLocalFilters(next)
    onChange(next)
  }

  const toggleArray = (key, value) => {
    const current = localFilters[key]
      ? localFilters[key].split(',').filter(Boolean)
      : []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    update(key, next.join(',') || undefined)
  }

  const isSelected = (key, value) => {
    const current = localFilters[key] ? localFilters[key].split(',') : []
    return current.includes(value)
  }

  const handlePriceCommit = ([min, max]) => {
    update('minPrice', min)
    update('maxPrice', max)
  }

  const activeCount = [
    localFilters.fabricType,
    localFilters.occasion,
    localFilters.yardage,
    localFilters.color,
    localFilters.minPrice !== meta?.priceRange.min && localFilters.minPrice,
    localFilters.maxPrice !== meta?.priceRange.max && localFilters.maxPrice
  ].filter(Boolean).length

  // ── Sidebar content ──────────────────────────────────
  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4
                      border-b border-gray-100 sticky top-0
                      bg-white z-10"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-brand-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeCount > 0 && (
            <span
              className="bg-brand-500 text-white text-xs
                             rounded-full w-5 h-5 flex items-center
                             justify-center font-bold"
            >
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={() => {
                onReset()
                setLocalFilters({})
              }}
              className="flex items-center gap-1 text-xs text-red-500
                         font-medium hover:text-red-700 transition-colors"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable filter body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ── Price Range ─────────────────────────────── */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            Price Range (PKR)
          </h4>
          <div className="px-1">
            <Slider
              min={meta?.priceRange.min ?? 0}
              max={meta?.priceRange.max ?? 10000}
              step={100}
              value={[
                localFilters.minPrice ?? meta?.priceRange.min ?? 0,
                localFilters.maxPrice ?? meta?.priceRange.max ?? 10000
              ]}
              onValueChange={([min, max]) => {
                setLocalFilters((f) => ({
                  ...f,
                  minPrice: min,
                  maxPrice: max
                }))
              }}
              onValueCommit={handlePriceCommit}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>Rs. {(localFilters.minPrice ?? 0).toLocaleString()}</span>
              <span>
                Rs. {(localFilters.maxPrice ?? 10000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Fabric Type ─────────────────────────────── */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            Fabric Type
          </h4>
          <div className="space-y-2">
            {FABRIC_TYPES.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isSelected('fabricType', value)}
                  onChange={() => toggleArray('fabricType', value)}
                  className="w-4 h-4 rounded border-gray-300
                             text-brand-500 focus:ring-brand-400 cursor-pointer"
                />
                <span
                  className="text-sm text-gray-700
                                 group-hover:text-brand-600 transition-colors capitalize"
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Occasion ────────────────────────────────── */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Occasion</h4>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleArray('occasion', value)}
                className={`px-3 py-1.5 rounded-full text-xs
                            font-medium border transition-all
                            ${
                              isSelected('occasion', value)
                                ? 'bg-brand-500 text-white border-brand-500'
                                : 'border-gray-200 text-gray-600 hover:border-brand-300'
                            }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Yardage ─────────────────────────────────── */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Yardage</h4>
          <div className="flex flex-wrap gap-2">
            {YARDAGES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleArray('yardage', value)}
                className={`px-3 py-1.5 rounded-full text-xs
                            font-medium border transition-all
                            ${
                              isSelected('yardage', value)
                                ? 'bg-brand-500 text-white border-brand-500'
                                : 'border-gray-200 text-gray-600 hover:border-brand-300'
                            }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Color ───────────────────────────────────── */}
        {meta?.colors?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Color</h4>
            <div className="flex flex-wrap gap-2">
              {meta.colors.slice(0, 20).map((color) => (
                <ColorDot
                  key={color}
                  color={color}
                  selected={isSelected('color', color)}
                  onClick={() => toggleArray('color', color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm sticky top-24 overflow-hidden"
        >
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
          {/* Drawer */}
          <div
            className="fixed inset-y-0 left-0 w-80 bg-white
                          z-50 lg:hidden shadow-2xl overflow-hidden
                          flex flex-col"
          >
            {content}
          </div>
        </>
      )}
    </>
  )
}
