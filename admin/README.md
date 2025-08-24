# QuickMart Admin Panel

React.js admin dashboard for managing the QuickMart grocery ordering system, built with Vite.

## Features

- Admin authentication
- Dashboard with analytics
- Product management (CRUD operations)
- Category management
- Order management and tracking
- Image upload with Cloudinary integration
- Responsive design

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Update API base URL in `src/services/api.js`:
\`\`\`javascript
const API_BASE_URL = 'http://your-backend-url:5000/api';
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open http://localhost:5173 in your browser

## Default Admin Credentials

- Email: admin@quickmart.com
- Password: admin123

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## Deployment

You can deploy the built files to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## Features Overview

### Dashboard
- Total orders, products, and categories statistics
- Recent orders overview
- Quick navigation to all sections

### Product Management
- Add, edit, and delete products
- Image upload with Cloudinary
- Category assignment
- Price and inventory management

### Category Management
- Create and manage product categories
- Category image upload
- Category-based product organization

### Order Management
- View all customer orders
- Update order status (pending → confirmed → delivered)
- Order details with customer information
- Cash on delivery tracking
