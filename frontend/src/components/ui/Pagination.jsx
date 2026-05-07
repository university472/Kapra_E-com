import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, hasNext, hasPrev } = pagination

  if (totalPages <= 1) return null

  // Build page numbers array with ellipsis
  const getPages = () => {
    const pages = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-1.5 px-3 py-2 text-sm
                   font-medium rounded-xl border border-gray-200
                   text-gray-600 hover:border-brand-300
                   hover:text-brand-600 disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} />
        Prev
      </button>

      {/* Page numbers */}
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-medium
                        transition-colors
                        ${
                          p === page
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                        }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1.5 px-3 py-2 text-sm
                   font-medium rounded-xl border border-gray-200
                   text-gray-600 hover:border-brand-300
                   hover:text-brand-600 disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
