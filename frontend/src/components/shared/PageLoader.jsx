export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 border-4 border-brand-200
                        border-t-brand-500 rounded-full animate-spin"
        />
        <p className="text-brand-500 font-display text-lg">Kapra Store</p>
      </div>
    </div>
  )
}
