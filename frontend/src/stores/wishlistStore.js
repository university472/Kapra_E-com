import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wishlistAPI } from '../api'
import { toast } from 'sonner'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      products: [],
      ids: [], // Just IDs — used for fast isWishlisted checks
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true })
        try {
          const { data } = await wishlistAPI.get()
          set({
            products: data.products,
            ids: data.products.map((p) => p._id)
          })
        } catch (err) {
          console.error('the error is:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchIds: async () => {
        try {
          const { data } = await wishlistAPI.getIds()
          set({ ids: data.ids.map((id) => id.toString()) })
        } catch (err) {
          console.error('the error is:', err)
        }
      },

      toggle: async (productId) => {
        const isWishlisted = get().ids.includes(productId)

        // Optimistic update
        set((state) => ({
          ids: isWishlisted
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId]
        }))

        try {
          const { data } = await wishlistAPI.toggle(productId)
          toast.success(
            data.added ? 'Added to wishlist ❤️' : 'Removed from wishlist'
          )
          // Sync full products list after toggle
          await get().fetchWishlist()
        } catch {
          // Revert on failure
          set((state) => ({
            ids: isWishlisted
              ? [...state.ids, productId]
              : state.ids.filter((id) => id !== productId)
          }))
          toast.error('Please login to use wishlist')
        }
      },

      isWishlisted: (productId) => get().ids.includes(productId),

      clearWishlist: () => set({ products: [], ids: [] })
    }),
    {
      name: 'kapra-wishlist',
      partialize: (state) => ({ ids: state.ids })
    }
  )
)
