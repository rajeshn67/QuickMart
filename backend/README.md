# QuickMart Backend API

Node.js backend server for the QuickMart grocery ordering system.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env` file with the following variables:
\`\`\`
MONGODB_URI=mongodb+srv://firstweb:GSQ9fjFvs6nsvKya@firstweb.9iplm.mongodb.net/Gro
JWT_SECRET=Rajesh@2004
PORT=5000
ADMIN_EMAIL=admin@quickmart.com
ADMIN_PASSWORD=admin123
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

3. Start the server:
\`\`\`bash
npm start
# or for development
npm run dev
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/admin` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Upload
- `POST /api/upload` - Upload image to Cloudinary

Server runs on port 5000 by default.
