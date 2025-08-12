#!/usr/bin/env tsx
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function makeUserAdmin() {
  // Get your user ID from environment or command line
  const userEmail = process.env.ADMIN_EMAIL || 'mequeamaddox@gmail.com';
  
  console.log(`Setting admin status for user: ${userEmail}`);
  
  try {
    const [user] = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, userEmail))
      .returning();
    
    if (user) {
      console.log(`✓ Successfully made ${userEmail} an admin`);
      console.log(`User ID: ${user.id}`);
    } else {
      console.log(`❌ User not found with email: ${userEmail}`);
      console.log('Make sure you have logged in at least once to create your user account');
    }
  } catch (error) {
    console.error('Error making user admin:', error);
  }
  
  process.exit(0);
}

makeUserAdmin();