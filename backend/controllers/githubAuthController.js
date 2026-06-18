import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ROUTE 1: The user clicks "Connect GitHub" on the frontend
export const initiateGitHubAuth = (req, res) => {
  // We pass the user's Sentinel ID in the 'state' parameter so we remember who they are when GitHub sends them back
  const operatorId = req.operator.id; 
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,read:user&state=${operatorId}`;
  
  res.json({ url: githubAuthUrl });
};

// ROUTE 2: GitHub redirects the user here with a temporary 'code'
export const githubCallback = async (req, res) => {
  const { code, state: operatorId } = req.query;

  try {
    // 1. Trade the temporary code for a permanent Access Token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Use the token to ask GitHub who this user is
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubData = userResponse.data;

    // 3. Save the token and GitHub identity to the operator's Sentinel profile
    await prisma.user.update({
      where: { id: operatorId },
      data: {
        githubId: githubData.id.toString(),
        githubUsername: githubData.login,
        githubToken: accessToken // Store this to fetch private commits later
      }
    });

    // 4. Redirect them back to the Sentinel Dashboard settings page
    res.redirect(`${process.env.FRONTEND_URL}/settings?github=connected`);

  } catch (error) {
    console.error("GitHub Auth Failed:", error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=github_auth_failed`);
  }
};