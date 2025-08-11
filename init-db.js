import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

await mongoose.connect(process.env.MONGODB_URI, {
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASSWORD
})

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  roles: [String]
})

const User = mongoose.model('User', userSchema)

async function initAdmin() {
  const salt = await bcrypt.genSalt()
  const password = await bcrypt.hash('Admin123!', salt)

  await User.create({
    username: 'superAdmin',
    email: 'admin@system.com',
    password,
    roles: ['admin']
  })

  console.log('Admin user created')
  await mongoose.disconnect()
}

initAdmin().catch(console.error)
