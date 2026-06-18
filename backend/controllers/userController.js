import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get the current user's profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.operator.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        role: true,
        githubId: true,
        githubUsername: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update the user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.operator.id;
    const { username, email, bio } = req.body;

    // Check if new username or email is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }) // Allow emptying bio
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        role: true,
        githubId: true,
        githubUsername: true,
      }
    });

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
