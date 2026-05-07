import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartAPI } from '../api'
import { toast } from 'sonner'
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from '../constants'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      itemCount: 0,
      isLoading: false,
      isSynced: false, // Whether cart has been fetched from backend

      // Compute totals locally (for optimistic updates)
      _computeTotals: (items) => {
        const subtotal = items.reduce(
          (sum, item) =>
            sum +
            (item.product?.salePrice || item.product?.price || item.price) *
              item.qty,
          0
        )
        const shippingFee =
          subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE
        return {
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          itemCount: items.reduce((sum, i) => sum + i.qty, 0)
        }
      },

      // Fetch cart from backend (called on app init & after login)
      fetchCart: async () => {
        set({ isLoading: true })
        try {
          const { data } = await cartAPI.get()
          const { items, subtotal, shippingFee, total, itemCount } = data.cart
          set({
            items,
            subtotal,
            shippingFee,
            total,
            itemCount,
            isSynced: true
          })
        } catch {
          // Silently fail — local state remains
        } finally {
          set({ isLoading: false })
        }
      },

      addItem: async (productId, qty = 1) => {
        set({ isLoading: true })
        try {
          await cartAPI.add({ productId, qty })
          await get().fetchCart()
          toast.success('Added to cart! 🛒')
        } catch (err) {
          toast.error(err.response?.data?.message || 'Could not add to cart')
        } finally {
          set({ isLoading: false })
        }
      },

      updateItem: async (productId, qty) => {
        try {
          await cartAPI.update({ productId, qty })
          await get().fetchCart()
        } catch (err) {
          toast.error(err.response?.data?.message || 'Update failed')
        }
      },

      removeItem: async (productId) => {
        try {
          await cartAPI.remove(productId)
          await get().fetchCart()
          toast.success('Item removed')
        } catch {
          toast.error('Could not remove item')
        }
      },

      clearCart: async () => {
        try {
          await cartAPI.clear()
          set({
            items: [],
            subtotal: 0,
            shippingFee: 0,
            total: 0,
            itemCount: 0
          })
        } catch (err) {
          console.error('the error is:', err)
        }
      },

      // Check if a product is already in cart
      isInCart: (productId) =>
        get().items.some(
          (i) => i.product?._id === productId || i.product === productId
        ),

      getItemQty: (productId) =>
        get().items.find((i) => i.product?._id === productId)?.qty ?? 0
    }),
    {
      name: 'kapra-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
)
