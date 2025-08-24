const User = require("../models/User")
require("dotenv").config()

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL })

    if (!adminExists) {
      const admin = new User({
        fullName: "Admin User",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      })

      await admin.save()
      console.log("Admin user created successfully")
    } else {
      console.log("Admin user already exists")
    }
  } catch (error) {
    console.error("Error seeding admin:", error)
  }
}

module.exports = seedAdmin
