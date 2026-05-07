import { useState, useEffect } from 'react'
import { Search, Shield, User, ShoppingBag } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuthStore } from '../../stores/authStore'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { toast } from 'sonner'

export default function AdminUsers() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = (p = 1, q = search) => {
    setLoading(true)
    adminAPI
      .getUsers({ page: p, limit: 20, search: q || undefined })
      .then(({ data }) => {
        setUsers(data.users)
        setPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchUsers(1, search)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change role to ${newRole}?`)) return
    try {
      await adminAPI.updateUserRole(userId, { role: newRole })
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      )
      toast.success(`Role updated to ${newRole}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <>
      <PageMeta title="Admin — Users" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Customers
          </h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total} registered customers
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2
                           text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-9 pr-4 py-3 border border-gray-200
                     rounded-xl text-sm bg-white focus:outline-none
                     focus:ring-2 focus:ring-brand-300 transition-all"
        />
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl border border-gray-100
                      shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_auto_auto_auto_auto]
                        gap-4 px-5 py-3 bg-gray-50 border-b
                        border-gray-100 text-xs font-bold
                        text-gray-500 uppercase tracking-wide"
        >
          <span>Customer</span>
          <span className="hidden sm:block">Joined</span>
          <span>Orders</span>
          <span className="hidden sm:block">Spent</span>
          <span>Role</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 shimmer rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((u) => (
              <div
                key={u._id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto]
                           gap-4 items-center px-5 py-3.5
                           hover:bg-gray-50 transition-colors"
              >
                {/* Customer info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 bg-gradient-to-br
                                  from-brand-300 to-brand-500
                                  rounded-xl flex items-center justify-center
                                  shrink-0 shadow-sm"
                  >
                    <span className="text-white font-bold text-sm">
                      {u.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Joined */}
                <p className="text-xs text-gray-500 hidden sm:block">
                  {new Date(u.createdAt).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit'
                  })}
                </p>

                {/* Order count */}
                <div
                  className="flex items-center gap-1 text-xs
                                text-gray-600 font-medium"
                >
                  <ShoppingBag size={13} className="text-brand-400" />
                  {u.orderCount}
                </div>

                {/* Total spent */}
                <p
                  className="text-sm font-bold text-brand-600
                              hidden sm:block"
                >
                  {formatPrice(u.totalSpent)}
                </p>

                {/* Role toggle */}
                <button
                  onClick={() =>
                    u._id !== me?._id && handleRoleToggle(u._id, u.role)
                  }
                  disabled={u._id === me?._id}
                  className={`flex items-center gap-1.5 px-2.5 py-1
                              rounded-full text-[10px] font-bold
                              transition-colors disabled:cursor-not-allowed
                              ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                  title={
                    u._id === me?._id
                      ? 'Cannot change your own role'
                      : 'Click to toggle role'
                  }
                >
                  {u.role === 'admin' ? (
                    <>
                      <Shield size={10} /> Admin
                    </>
                  ) : (
                    <>
                      <User size={10} /> User
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div
            className="flex items-center justify-between
                          px-5 py-4 border-t border-gray-100"
          >
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const p = page - 1
                  setPage(p)
                  fetchUsers(p, search)
                }}
                disabled={!pagination.hasPrev}
                className="px-3 py-1.5 border border-gray-200 rounded-lg
                           text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  const p = page + 1
                  setPage(p)
                  fetchUsers(p, search)
                }}
                disabled={!pagination.hasNext}
                className="px-3 py-1.5 border border-gray-200 rounded-lg
                           text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
