import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// 1. REGISTER ROUTE
export const registerUser = async (req, res) => {
  try { 
    const { username, email, password, bio, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Supabase via Prisma
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        bio,
        role: role || 'DEVELOPER' // Default role if not passed
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      userId: newUser.id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

// 2. LOGIN ROUTE
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate the JWT token containing user profile and role details
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 1 day
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token // Send token to frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const logoutUser = (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully. Remove the token from client-side storage.' 
  });
};