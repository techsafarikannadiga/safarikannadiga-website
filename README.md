# 🦁 SafariKannadiga Website

A premium wildlife safari and photography tours website built with modern web technologies. Features a powerful admin panel for managing gallery photos across multiple destinations.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![ImageKit](https://img.shields.io/badge/ImageKit-Storage-orange?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)

---

## ✨ Features

### 🎨 Frontend
- **Responsive Design** - Mobile-first, works beautifully on all devices
- **Dynamic Gallery** - Browse photos by continent and location
- **Hero Carousel** - Auto-rotating showcase of best wildlife shots
- **Smooth Animations** - Framer Motion powered transitions
- **Lightbox Viewer** - Full-screen photo viewing experience
- **SEO Optimized** - Dynamic sitemap and meta tags

### 🔧 Admin Panel (`/admin`)
- **Upload Photos** - Drag & drop with automatic compression (96%+ reduction)
- **Manage Locations** - Add/edit/delete safari destinations
- **Set Cover Photos** - Choose featured images for each location
- **Edit Location Info** - Update descriptions, wildlife lists, country
- **Real-time Preview** - See changes instantly

### 📸 Image Management
- **ImageKit Storage** - 20GB free, no upload rate limits
- **Auto Compression** - Sharp-powered JPEG optimization (2400px, 85% quality)
- **Responsive Images** - Dynamic transformations via URL parameters
- **Folder Organization** - `safari-gallery/[Continent]/[Location]/`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, React Server Components) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 |
| **Image Storage** | ImageKit (20GB free tier) |
| **Database** | Supabase PostgreSQL |
| **Animations** | Framer Motion |
| **Image Compression** | Sharp |
| **Fonts** | Inter + Playfair Display |

---

## 📁 Project Structure

```
safarikannadiga-website/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout with header/footer
│   ├── admin/                # Admin panel
│   ├── gallery/              # Gallery pages
│   │   ├── [continent]/      # Continent listing
│   │   └── [continent]/[location]/  # Location photos
│   └── api/                  # API routes
│       ├── admin/gallery/    # Photo CRUD operations
│       └── admin/locations/  # Location management
├── components/
│   ├── layout/               # Header, Footer
│   ├── sections/             # Home page sections
│   ├── gallery/              # Gallery components
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── gallery-cloud.ts      # Main gallery logic (ImageKit + Supabase)
│   ├── imagekit.ts           # ImageKit SDK wrapper
│   ├── supabase.ts           # Supabase database client
│   ├── image-utils.ts        # Image URL utilities
│   └── content.ts            # Content/settings loader
├── content/                  # JSON config files (fallback)
├── public/                   # Static assets
└── scripts/
    ├── supabase-setup.sql    # Database schema
    └── bulk-upload.js        # Batch upload utility
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- ImageKit account (free)
- Supabase account (free)

### 1. Clone & Install

```bash
git clone https://github.com/techsafarikannadiga/safarikannadiga-website.git
cd safarikannadiga-website
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
# ImageKit Configuration
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Setup

Run the SQL in `scripts/supabase-setup.sql` in your Supabase SQL Editor to create:
- `gallery_locations` - Location metadata
- `gallery_covers` - Cover photo selections

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎛️ Admin Panel Usage

Access the admin panel at `/admin`:

### Upload Photos
1. Select continent and location
2. Drag & drop images (auto-compressed to ~500KB)
3. Images appear in gallery immediately

### Manage Locations
1. Click "Manage Locations"
2. Add new locations with continent, name, country
3. Edit existing location descriptions and wildlife

### Set Cover Photos
1. Click any image thumbnail
2. Select "Set as Cover Photo"
3. Cover appears on gallery cards

### Edit Location Info
1. Click "Edit Info" button on any location
2. Update description, wildlife list, country
3. Save changes

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Home   │  │  Gallery │  │  Admin   │  │  Tours   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘    │
│       │             │             │                          │
│       └─────────────┼─────────────┘                          │
│                     ▼                                        │
│           ┌─────────────────┐                                │
│           │  gallery-cloud  │  (Main Business Logic)         │
│           └────────┬────────┘                                │
│                    │                                         │
│         ┌──────────┴──────────┐                              │
│         ▼                     ▼                              │
│   ┌───────────┐        ┌───────────┐                        │
│   │ ImageKit  │        │ Supabase  │                        │
│   │ (Images)  │        │ (Metadata)│                        │
│   └───────────┘        └───────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints

### Gallery Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/gallery` | Fetch full gallery structure |
| POST | `/api/admin/gallery` | Upload image (with compression) |
| DELETE | `/api/admin/gallery` | Delete image |
| PATCH | `/api/admin/gallery` | Set cover photo |

### Location Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/locations` | List all continents |
| POST | `/api/admin/locations` | Add new location |
| DELETE | `/api/admin/locations` | Delete location |
| PATCH | `/api/admin/locations` | Update location details |

---

## 🖼️ Image Optimization

Images are automatically optimized on upload:

| Setting | Value |
|---------|-------|
| Max Width | 2400px |
| Quality | 85% |
| Format | JPEG (mozjpeg) |
| Compression | ~96% size reduction |

Example: 16.5MB → 0.55MB

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, destinations, tours, testimonials |
| Gallery | `/gallery` | All continents overview |
| Continent | `/gallery/[continent]` | Locations in continent |
| Location | `/gallery/[continent]/[location]` | Photos grid + lightbox |
| Admin | `/admin` | Photo management panel |
| About | `/about` | About Safari Kannadiga |
| Contact | `/contact` | Contact form |
| Tours | `/upcoming-tours` | Upcoming safari tours |

---

## 🎨 Design System

### Colors
- **Safari Gold**: `#C9A227` - Primary accent
- **Forest Green**: `#2D5016` - Secondary
- **Neutral Charcoal**: `#1A1A1A` - Dark backgrounds
- **Neutral Cream**: `#F5F5DC` - Light backgrounds

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

---

## 📝 Scripts

```bash
# Development
npm run dev       # Start dev server with Turbopack

# Production
npm run build     # Build for production
npm run start     # Start production server

# Utilities
npm run lint      # Run ESLint
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IMAGEKIT_PRIVATE_KEY` | Yes | ImageKit private API key |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | Yes | ImageKit URL endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify
1. Push to GitHub
2. New site from Git
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables

---

## 📄 License

This project is proprietary software for SafariKannadiga.

---

## 👨‍💻 Developer

**Designed & Developed by [Samarth V](https://samarthv.me)**

---

## 🙏 Acknowledgments

- Wildlife photography by Safari Kannadiga team
- Icons from Heroicons
- Fonts from Google Fonts
