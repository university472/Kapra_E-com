import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of product objects (lightweight)

      add: (product) => {
        const filtered = get().items.filter((p) => p._id !== product._id)
        set({
          items: [
            {
              _id: product._id,
              name: product.name,
              images: product.images?.slice(0, 1),
              price: product.price,
              salePrice: product.salePrice,
              fabricType: product.fabricType,
              slug: product.slug
            },
            ...filtered
          ].slice(0, 10) // Keep last 10
        })
      },

      clear: () => set({ items: [] })
    }),
    { name: 'kapra-recently-viewed' }
  )
)
