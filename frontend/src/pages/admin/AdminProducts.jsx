import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
  Package,
  ImagePlus,
  Check,
  ChevronDown
} from 'lucide-react'
import { productAPI, categoryAPI } from '../../api'
import { formatPrice, getStockLabel } from '../../lib/utils'
import { FABRIC_TYPES, OCCASIONS, YARDAGES } from '../../constants'
import { toast } from 'sonner'
import PageMeta from '../../components/shared/PageMeta'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewImgs, setPreviewImgs] = useState([])
  const fileRef = useRef(null)

  // Form state
  const emptyForm = {
    name: '',
    description: '',
    price: '',
    salePrice: '',
    category: '',
    fabricType: '',
    gsm: '',
    yardage: '',
    colors: '',
    washCare: '',
    stock: '',
    occasion: '',
    isFeatured: false,
    isActive: true,
    tags: ''
  }
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])

  const fetchProducts = (p = page, q = search) => {
    setLoading(true)
    productAPI
      .getAll({ page: p, limit: 15, search: q || undefined })
      .then(({ data }) => {
        setProducts(data.products)
        setPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
    categoryAPI
      .getAll()
      .then(({ data }) =>
        setCategories(data.flatMap((c) => [c, ...(c.children || [])]))
      )
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchProducts(1, search)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFiles([])
    setPreviewImgs([])
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditing(product._id)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      category: product.category?._id || product.category || '',
      fabricType: product.fabricType || '',
      gsm: product.gsm || '',
      yardage: product.yardage || '',
      colors: (product.colors || []).join(', '),
      washCare: product.washCare || '',
      stock: product.stock || '',
      occasion: product.occasion || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
      tags: (product.tags || []).join(', ')
    })
    setPreviewImgs(product.images || [])
    setFiles([])
    setShowForm(true)
    setTimeout(
      () =>
        document.getElementById('product-form')?.scrollIntoView({
          behavior: 'smooth'
        }),
      100
    )
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setPreviewImgs(selected.map((f) => URL.createObjectURL(f)))
  }

  const handleSave = async () => {
    if (
      !form.name ||
      !form.price ||
      !form.category ||
      !form.fabricType ||
      !form.stock
    ) {
      toast.error('Fill in: name, price, category, fabric type, stock')
      return
    }
    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        fd.append(k, v)
      }
    })
    // Parse arrays
    if (form.colors)
      fd.set(
        'colors',
        JSON.stringify(
          form.colors
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        )
      )
    if (form.tags)
      fd.set(
        'tags',
        JSON.stringify(
          form.tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        )
      )
    files.forEach((f) => fd.append('images', f))

    try {
      if (editing) {
        await productAPI.update(editing, fd)
        toast.success('Product updated ✅')
      } else {
        await productAPI.create(fd)
        toast.success('Product created ✅')
      }
      setShowForm(false)
      fetchProducts(page, search)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (product) => {
    try {
      await productAPI.update(product._id, { isActive: !product.isActive })
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isActive: !p.isActive } : p
        )
      )
      toast.success(product.isActive ? 'Product hidden' : 'Product visible')
    } catch {
      toast.error('Could not update')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return
    try {
      await productAPI.delete(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      toast.success('Product deactivated')
    } catch {
      toast.error('Could not delete')
    }
  }

  return (
    <>
      <PageMeta title="Admin — Products" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Products
          </h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total} total products
            </p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand-500 text-white
                     px-5 py-2.5 rounded-xl font-bold text-sm
                     hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2
                           text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or tag..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200
                     rounded-xl text-sm bg-white focus:outline-none
                     focus:ring-2 focus:ring-brand-300 transition-all"
        />
      </div>

      {/* ── Product Form ───────────────────────────────── */}
      {showForm && (
        <div
          id="product-form"
          className="bg-white rounded-2xl border border-brand-200
                        shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-gray-900">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                          gap-4"
          >
            {/* Basic fields */}
            {[
              {
                key: 'name',
                label: 'Product Name *',
                span: 'lg:col-span-2',
                placeholder: 'Gul Ahmed Summer Lawn'
              },
              {
                key: 'price',
                label: 'Price (PKR) *',
                type: 'number',
                placeholder: '2500'
              },
              {
                key: 'salePrice',
                label: 'Sale Price',
                type: 'number',
                placeholder: 'Leave empty if no sale'
              },
              {
                key: 'stock',
                label: 'Stock (units) *',
                type: 'number',
                placeholder: '50'
              },
              {
                key: 'gsm',
                label: 'GSM Weight',
                type: 'number',
                placeholder: '70'
              },
              {
                key: 'colors',
                label: 'Colors (comma separated)',
                span: 'lg:col-span-2',
                placeholder: 'White, Pink, Blue'
              },
              {
                key: 'washCare',
                label: 'Wash Care',
                placeholder: 'Hand wash / Dry clean'
              },
              {
                key: 'tags',
                label: 'Tags (comma separated)',
                placeholder: 'lawn, summer, eid'
              }
            ].map(({ key, label, type = 'text', span = '', placeholder }) => (
              <div key={key} className={span}>
                <label
                  className="block text-xs font-semibold
                                   text-gray-600 mb-1.5 uppercase tracking-wide"
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200
                             rounded-xl text-sm bg-gray-50 focus:bg-white
                             focus:outline-none focus:ring-2
                             focus:ring-brand-300 transition-all"
                />
              </div>
            ))}

            {/* Selects */}
            <div>
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-1.5 uppercase tracking-wide"
              >
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm bg-gray-50 focus:bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-brand-300 transition-all"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-1.5 uppercase tracking-wide"
              >
                Fabric Type *
              </label>
              <select
                value={form.fabricType}
                onChange={(e) =>
                  setForm({ ...form, fabricType: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm bg-gray-50 focus:bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-brand-300 transition-all"
              >
                <option value="">Select type</option>
                {FABRIC_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-1.5 uppercase tracking-wide"
              >
                Yardage
              </label>
              <select
                value={form.yardage}
                onChange={(e) => setForm({ ...form, yardage: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm bg-gray-50 focus:bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-brand-300 transition-all"
              >
                <option value="">Select yardage</option>
                {YARDAGES.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-1.5 uppercase tracking-wide"
              >
                Occasion
              </label>
              <select
                value={form.occasion}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm bg-gray-50 focus:bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-brand-300 transition-all"
              >
                <option value="">Select occasion</option>
                {OCCASIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="lg:col-span-3">
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-1.5 uppercase tracking-wide"
              >
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Describe the fabric quality, design, and usage..."
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm bg-gray-50 focus:bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-brand-300 transition-all resize-none"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 lg:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  ✨ Featured product
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active / Visible
                </span>
              </label>
            </div>

            {/* Image upload */}
            <div className="lg:col-span-3">
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-2 uppercase tracking-wide"
              >
                Product Images
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 border-2
                           border-dashed border-gray-300 rounded-xl text-sm
                           text-gray-500 hover:border-brand-400
                           hover:text-brand-600 transition-colors w-full
                           justify-center bg-gray-50"
              >
                <ImagePlus size={18} />
                Click to upload images (max 8)
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleFileChange}
              />
              {previewImgs.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previewImgs.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${i + 1}`}
                        className="w-20 h-24 object-cover rounded-xl
                                   border border-gray-200"
                      />
                      <div
                        className="absolute inset-0 bg-black/40
                                      rounded-xl opacity-0 group-hover:opacity-100
                                      transition-opacity flex items-center
                                      justify-center"
                      >
                        <span className="text-white text-xs font-bold">
                          {i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-brand-500 text-white
                         px-8 py-3 rounded-xl font-bold text-sm
                         hover:bg-brand-600 transition-colors
                         disabled:opacity-50"
            >
              {saving ? (
                <span
                  className="w-4 h-4 border-2 border-white/30
                                 border-t-white rounded-full animate-spin"
                />
              ) : (
                <Check size={16} />
              )}
              {saving
                ? 'Saving…'
                : editing
                  ? 'Update Product'
                  : 'Create Product'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 rounded-xl border border-gray-200
                         text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Products Table ────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-gray-100
                      shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 text-gray-200" />
            <p>No products found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto]
                            gap-4 px-5 py-3 bg-gray-50 border-b
                            border-gray-100 text-xs font-bold
                            text-gray-500 uppercase tracking-wide"
            >
              <span>Image</span>
              <span>Product</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {products.map((p) => {
                const stockInfo = getStockLabel(p.stock)
                return (
                  <div
                    key={p._id}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto]
                               gap-4 items-center px-5 py-3.5
                               hover:bg-gray-50 transition-colors"
                  >
                    {/* Image */}
                    <img
                      src={p.images?.[0] || '/placeholder.png'}
                      alt={p.name}
                      className="w-10 h-12 object-cover rounded-lg
                                 border border-gray-100"
                    />

                    {/* Name */}
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold text-gray-800
                                     line-clamp-1"
                      >
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span
                          className="text-[10px] bg-gray-100 text-gray-500
                                         px-1.5 py-0.5 rounded capitalize"
                        >
                          {p.fabricType}
                        </span>
                        {p.category?.name && (
                          <span
                            className="text-[10px] bg-brand-50 text-brand-600
                                           px-1.5 py-0.5 rounded"
                          >
                            {p.category.name}
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="text-[10px]">✨</span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-600">
                        {formatPrice(p.salePrice || p.price)}
                      </p>
                      {p.salePrice && (
                        <p className="text-[10px] text-gray-400 line-through">
                          {formatPrice(p.price)}
                        </p>
                      )}
                    </div>

                    {/* Stock */}
                    <span
                      className={`text-xs font-bold
                                      ${stockInfo.color}`}
                    >
                      {p.stock}
                    </span>

                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`p-1.5 rounded-lg transition-colors
                                  ${
                                    p.isActive
                                      ? 'text-green-600 hover:bg-green-50'
                                      : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                      title={p.isActive ? 'Visible' : 'Hidden'}
                    >
                      {p.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-brand-500
                                   hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500
                                   hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

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
                      setPage((p) => p - 1)
                      fetchProducts(page - 1, search)
                    }}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg
                               text-sm disabled:opacity-40 hover:border-brand-300
                               transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      setPage((p) => p + 1)
                      fetchProducts(page + 1, search)
                    }}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg
                               text-sm disabled:opacity-40 hover:border-brand-300
                               transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
