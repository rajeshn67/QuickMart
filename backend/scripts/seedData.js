const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const Category = require("../models/Category")
const Product = require("../models/Product")

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Product.deleteMany({})

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true,
    })

    // Create sample categories
    const categories = await Category.insertMany([
      {
        name: "Fresh Vegetables",
        image: "/fresh-vegetables.png",
        description: "Fresh and organic vegetables",
      },
      {
        name: "Fruits",
        image: "/fresh-fruits.png",
        description: "Seasonal fresh fruits",
      },
      {
        name: "Beverages",
        image: "/beverages-drinks.png",
        description: "Refreshing drinks and beverages",
      },
      {
        name: "Snacks",
        image: "/snacks-chips.png",
        description: "Tasty snacks and chips",
      },
    ])

    // Create sample products
    await Product.insertMany([
      {
        name: "Fresh Tomatoes",
        description: "Organic red tomatoes",
        price: 2.99,
        image: "/fresh-red-tomatoes.png",
        category: categories[0]._id,
        stock: 50,
        unit: "kg",
      },
      {
        name: "Bananas",
        description: "Sweet yellow bananas",
        price: 1.99,
        image: "/yellow-bananas.png",
        category: categories[1]._id,
        stock: 30,
        unit: "kg",
      },
      {
        name: "Coca Cola",
        description: "Refreshing cola drink",
        price: 1.5,
        image: "/classic-coca-cola.png",
        category: categories[2]._id,
        stock: 100,
        unit: "bottle",
      },
      {
        name: "Potato Chips",
        description: "Crispy potato chips",
        price: 2.5,
        image: "/potato-chips-bag.png",
        category: categories[3]._id,
        stock: 75,
        unit: "pack",
      },
    ])

    console.log("Sample data seeded successfully!")
    console.log("Admin credentials:")
    console.log("Email:", process.env.ADMIN_EMAIL)
    console.log("Password:", process.env.ADMIN_PASSWORD)

    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
