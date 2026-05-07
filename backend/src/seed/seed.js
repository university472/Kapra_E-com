import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

dotenv.config()
await connectDB()

// ── Categories ────────────────────────────────────────────
const categories = await Category.insertMany([
  { name: 'Women Lawn', slug: 'women-lawn', isActive: true },
  { name: 'Women Khaddar', slug: 'women-khaddar', isActive: true },
  { name: 'Men Khaddar', slug: 'men-khaddar', isActive: true },
  { name: 'Cotton Unstitched', slug: 'cotton-unstitched', isActive: true },
  { name: 'Chiffon Dupatta', slug: 'chiffon-dupatta', isActive: true }
])

const [lawn, khaddar, menKhaddar, cotton, chiffon] = categories

// ── Admin User ─────────────────────────────────────────────
const adminExists = await User.findOne({ email: 'admin@kapra.store' })
if (!adminExists) {
  await User.create({
    name: 'Admin',
    email: 'admin@kapra.store',
    phone: '03001234567',
    passwordHash: await bcrypt.hash('Admin@1234', 12),
    role: 'admin',
    isVerified: true
  })
  console.log('✅ Admin created: admin@kapra.store / Admin@1234')
}

// ── Products ──────────────────────────────────────────────
const products = [
  // LAWN (5)
  {
    name: 'Gul Ahmed Summer Lawn 3-Piece',
    slug: 'gul-ahmed-summer-lawn-3-piece',
    description:
      'Premium summer lawn with embroidered front, printed back and sleeves, with chiffon dupatta.',
    images: ['https://placehold.co/600x750/f9e4d4/b45309?text=Lawn+1'],
    price: 3200,
    salePrice: 2800,
    category: lawn._id,
    fabricType: 'lawn',
    gsm: 65,
    yardage: 3,
    colors: ['White', 'Pink'],
    stock: 45,
    isFeatured: true,
    occasion: 'casual',
    tags: ['lawn', 'summer', '3-piece']
  },
  {
    name: 'Sapphire Printed Lawn Suit',
    slug: 'sapphire-printed-lawn-suit',
    description:
      'Vibrant printed lawn kurta with plain trouser fabric and chiffon dupatta.',
    images: ['https://placehold.co/600x750/d4e4f9/1e3a5f?text=Lawn+2'],
    price: 2750,
    salePrice: null,
    category: lawn._id,
    fabricType: 'lawn',
    gsm: 70,
    yardage: 3,
    colors: ['Blue', 'Navy'],
    stock: 30,
    isFeatured: true,
    occasion: 'everyday',
    tags: ['lawn', 'sapphire', 'printed']
  },
  {
    name: 'Alkaram Floral Lawn 2-Piece',
    slug: 'alkaram-floral-lawn-2-piece',
    description:
      'Light floral digital print lawn with coordinated trouser fabric.',
    images: ['https://placehold.co/600x750/e4f9d4/1e5f3a?text=Lawn+3'],
    price: 1950,
    salePrice: 1700,
    category: lawn._id,
    fabricType: 'lawn',
    gsm: 60,
    yardage: 2.5,
    colors: ['Green', 'Yellow'],
    stock: 60,
    isFeatured: false,
    occasion: 'casual',
    tags: ['lawn', 'floral', '2-piece']
  },
  {
    name: 'Orient Textiles Eid Lawn',
    slug: 'orient-textiles-eid-lawn',
    description:
      'Embroidered eid collection lawn suit with heavy work border dupatta.',
    images: ['https://placehold.co/600x750/f9f4d4/5f4a1e?text=Lawn+4'],
    price: 4500,
    salePrice: 4000,
    category: lawn._id,
    fabricType: 'lawn',
    gsm: 72,
    yardage: 3.5,
    colors: ['Ivory', 'Gold'],
    stock: 20,
    isFeatured: true,
    occasion: 'eid',
    tags: ['eid', 'lawn', 'embroidered']
  },
  {
    name: 'Nishat Linen Premium Lawn',
    slug: 'nishat-linen-premium-lawn',
    description:
      'Fine quality lawn with subtle texture and delicate embroidery.',
    images: ['https://placehold.co/600x750/f4d4f9/5f1e5f?text=Lawn+5'],
    price: 3100,
    salePrice: null,
    category: lawn._id,
    fabricType: 'lawn',
    gsm: 68,
    yardage: 3,
    colors: ['Lilac', 'Mauve'],
    stock: 35,
    isFeatured: false,
    occasion: 'formal',
    tags: ['lawn', 'nishat', 'premium']
  },

  // KHADDAR (5)
  {
    name: 'Bareeze Khaddar Winter Collection',
    slug: 'bareeze-khaddar-winter',
    description:
      'Warm, thick khaddar with intricate embroidery — perfect for cold months.',
    images: ['https://placehold.co/600x750/f9d4d4/5f1e1e?text=Khaddar+1'],
    price: 3800,
    salePrice: 3400,
    category: khaddar._id,
    fabricType: 'khaddar',
    gsm: 180,
    yardage: 3,
    colors: ['Maroon', 'Deep Red'],
    stock: 25,
    isFeatured: true,
    occasion: 'formal',
    tags: ['khaddar', 'winter', 'embroidered']
  },
  {
    name: 'Gul Ahmed Khaddar Karandi',
    slug: 'gul-ahmed-khaddar-karandi',
    description:
      'Soft karandi fabric with digital print and matching pashmina shawl.',
    images: ['https://placehold.co/600x750/d4d4f9/1e1e5f?text=Khaddar+2'],
    price: 4200,
    salePrice: null,
    category: khaddar._id,
    fabricType: 'khaddar',
    gsm: 190,
    yardage: 3.5,
    colors: ['Teal', 'Dark Blue'],
    stock: 18,
    isFeatured: true,
    occasion: 'formal',
    tags: ['khaddar', 'karandi', 'shawl']
  },
  {
    name: 'Limelight Casual Khaddar',
    slug: 'limelight-casual-khaddar',
    description:
      'Casual everyday khaddar in earthy tones with simple block print.',
    images: ['https://placehold.co/600x750/f9ead4/5f3a1e?text=Khaddar+3'],
    price: 2200,
    salePrice: 1900,
    category: khaddar._id,
    fabricType: 'khaddar',
    gsm: 160,
    yardage: 3,
    colors: ['Rust', 'Beige'],
    stock: 50,
    isFeatured: false,
    occasion: 'casual',
    tags: ['khaddar', 'casual', 'earthy']
  },
  {
    name: 'Zara Shahjahan Khaddar Luxury',
    slug: 'zara-shahjahan-khaddar-luxury',
    description:
      'Luxury khaddar with heavy hand embroidery on yoke and sleeves.',
    images: ['https://placehold.co/600x750/f4f9d4/3a5f1e?text=Khaddar+4'],
    price: 6500,
    salePrice: 5800,
    category: khaddar._id,
    fabricType: 'khaddar',
    gsm: 200,
    yardage: 3.5,
    colors: ['Olive', 'Forest Green'],
    stock: 10,
    isFeatured: true,
    occasion: 'party',
    tags: ['luxury', 'khaddar', 'hand-embroidered']
  },
  {
    name: 'Charcoal Khaddar Plain',
    slug: 'charcoal-khaddar-plain',
    description:
      'Solid charcoal grey khaddar fabric — 3 meters, perfect for tailoring.',
    images: ['https://placehold.co/600x750/d4d4d4/333333?text=Khaddar+5'],
    price: 1200,
    salePrice: null,
    category: khaddar._id,
    fabricType: 'khaddar',
    gsm: 170,
    yardage: 3,
    colors: ['Charcoal', 'Grey'],
    stock: 80,
    isFeatured: false,
    occasion: 'everyday',
    tags: ['khaddar', 'plain', 'unstitched']
  },

  // COTTON (4)
  {
    name: 'Block Print Cotton Suit',
    slug: 'block-print-cotton-suit',
    description:
      'Handblock-printed cotton with contrast border, breathable and cool.',
    images: ['https://placehold.co/600x750/fff3d4/5f4a00?text=Cotton+1'],
    price: 1600,
    salePrice: 1400,
    category: cotton._id,
    fabricType: 'cotton',
    gsm: 130,
    yardage: 3,
    colors: ['Mustard', 'White'],
    stock: 40,
    isFeatured: false,
    occasion: 'casual',
    tags: ['cotton', 'block-print', 'summer']
  },
  {
    name: 'Premium Cotton Voile Dupatta Set',
    slug: 'premium-cotton-voile-dupatta-set',
    description:
      'Fine cotton voile shirt fabric with embroidered border dupatta.',
    images: ['https://placehold.co/600x750/d4f9f4/1e5f58?text=Cotton+2'],
    price: 2100,
    salePrice: null,
    category: cotton._id,
    fabricType: 'cotton',
    gsm: 100,
    yardage: 3,
    colors: ['Aqua', 'White'],
    stock: 28,
    isFeatured: false,
    occasion: 'everyday',
    tags: ['cotton', 'voile', 'dupatta']
  },
  {
    name: 'Oxford Cotton Plain White',
    slug: 'oxford-cotton-plain-white',
    description:
      'Classic white oxford cotton — 2.5 meters for everyday kurta stitching.',
    images: ['https://placehold.co/600x750/f9f9f9/333333?text=Cotton+3'],
    price: 800,
    salePrice: null,
    category: cotton._id,
    fabricType: 'cotton',
    gsm: 140,
    yardage: 2.5,
    colors: ['White'],
    stock: 100,
    isFeatured: false,
    occasion: 'casual',
    tags: ['cotton', 'plain', 'white']
  },
  {
    name: 'Ikat Pattern Cotton Unstitched',
    slug: 'ikat-pattern-cotton-unstitched',
    description:
      'Traditional ikat pattern cotton in rich jewel tones — 3 piece.',
    images: ['https://placehold.co/600x750/f9d4f4/5f1e5a?text=Cotton+4'],
    price: 2400,
    salePrice: 2100,
    category: cotton._id,
    fabricType: 'cotton',
    gsm: 135,
    yardage: 3,
    colors: ['Purple', 'Fuchsia'],
    stock: 22,
    isFeatured: true,
    occasion: 'party',
    tags: ['cotton', 'ikat', '3-piece']
  },

  // CHIFFON (3)
  {
    name: 'Embroidered Chiffon Dupatta – Blush',
    slug: 'embroidered-chiffon-dupatta-blush',
    description:
      'Delicate chiffon dupatta with fine thread embroidery along all four borders.',
    images: ['https://placehold.co/600x750/f9d4e4/5f1e30?text=Chiffon+1'],
    price: 950,
    salePrice: 800,
    category: chiffon._id,
    fabricType: 'chiffon',
    gsm: 30,
    yardage: 2.5,
    colors: ['Blush', 'Pink'],
    stock: 55,
    isFeatured: false,
    occasion: 'formal',
    tags: ['chiffon', 'dupatta', 'embroidered']
  },
  {
    name: 'Heavy Organza Bridal Dupatta',
    slug: 'heavy-organza-bridal-dupatta',
    description:
      'Ornate organza dupatta with heavy zari work — bridal collection.',
    images: ['https://placehold.co/600x750/f9f0d4/5f4a00?text=Chiffon+2'],
    price: 2800,
    salePrice: null,
    category: chiffon._id,
    fabricType: 'organza',
    gsm: 45,
    yardage: 2.5,
    colors: ['Gold', 'Ivory'],
    stock: 12,
    isFeatured: true,
    occasion: 'bridal',
    tags: ['organza', 'dupatta', 'bridal']
  },
  {
    name: 'Silk Chiffon Ombre Dupatta',
    slug: 'silk-chiffon-ombre-dupatta',
    description:
      'Beautiful ombre-dyed silk chiffon dupatta — flows like water.',
    images: ['https://placehold.co/600x750/d4e4f9/1e3050?text=Chiffon+3'],
    price: 1500,
    salePrice: 1200,
    category: chiffon._id,
    fabricType: 'silk',
    gsm: 35,
    yardage: 2.5,
    colors: ['Blue', 'Lavender'],
    stock: 30,
    isFeatured: false,
    occasion: 'party',
    tags: ['silk', 'ombre', 'dupatta']
  },

  // MEN KHADDAR (3)
  {
    name: "Men's Classic Khaddar Shalwar Kameez Fabric",
    slug: 'mens-classic-khaddar-fabric',
    description:
      "Warm, earthy-toned khaddar for men's shalwar kameez — 4 meters included.",
    images: ['https://placehold.co/600x750/e4d4d4/3a1e1e?text=Men+Khaddar+1'],
    price: 2200,
    salePrice: null,
    category: menKhaddar._id,
    fabricType: 'khaddar',
    gsm: 200,
    yardage: 3.5,
    colors: ['Camel', 'Brown'],
    stock: 35,
    isFeatured: false,
    occasion: 'casual',
    tags: ['men', 'khaddar', 'shalwar-kameez']
  },
  {
    name: "Men's Black Khaddar Premium",
    slug: 'mens-black-khaddar-premium',
    description:
      'Solid black thick khaddar for men — ideal for formal occasions.',
    images: ['https://placehold.co/600x750/1a1a1a/ffffff?text=Men+Khaddar+2'],
    price: 2600,
    salePrice: 2300,
    category: menKhaddar._id,
    fabricType: 'khaddar',
    gsm: 210,
    yardage: 3.5,
    colors: ['Black'],
    stock: 20,
    isFeatured: false,
    occasion: 'formal',
    tags: ['men', 'khaddar', 'black', 'formal']
  },
  {
    name: "Men's Shawl Kameez Fabric Set",
    slug: 'mens-shawl-kameez-fabric-set',
    description:
      'Khaddar kameez fabric + matching woolen shawl — complete winter set.',
    images: ['https://placehold.co/600x750/d4e4d4/1e3a1e?text=Men+Khaddar+3'],
    price: 3500,
    salePrice: 3000,
    category: menKhaddar._id,
    fabricType: 'khaddar',
    gsm: 220,
    yardage: 3.5,
    colors: ['Khaki', 'Green'],
    stock: 15,
    isFeatured: true,
    occasion: 'formal',
    tags: ['men', 'khaddar', 'shawl', 'winter']
  }
]

await Product.insertMany(products)
console.log(`✅ Seeded ${products.length} products`)
console.log('✅ Seeded categories:', categories.map((c) => c.name).join(', '))
mongoose.disconnect()
