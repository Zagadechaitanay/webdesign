import FirebaseUser from './models/FirebaseUser.js';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    console.log('Testing admin login...');
    
    // Find the admin user
    const user = await FirebaseUser.findOne({ email: 'admin@eduportal.com' });
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', user.email);
    console.log('User type:', user.userType);
    console.log('Stored password hash:', user.password);
    
    // Test password verification
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password verification result:', isValid);
    
    if (isValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed');
      
      // Let's try to hash the password again and compare
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash:', newHash);
      console.log('New hash matches:', await bcrypt.compare(testPassword, newHash));
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testLogin();
