// Test login script
async function testLogin() {
  try {
    console.log('Testing login...');
    
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      console.log('Login successful! Redirecting...');
      window.location.href = '/admin';
    } else {
      console.log('Login failed:', data.error);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Run the test
testLogin();
