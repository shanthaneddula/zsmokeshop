const fs = require('fs');

async function testUpload() {
  try {
    console.log('🧪 Testing upload endpoint...');
    
    // First, let's get a token by logging in
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Instagram@501'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error('Failed to login');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful, token received');
    
    // Now test the upload
    const formData = new FormData();
    
    // Create a simple test file
    const testContent = 'test image content';
    const blob = new Blob([testContent], { type: 'image/jpeg' });
    formData.append('file', blob, 'test.jpg');
    formData.append('category', 'general');
    
    console.log('📤 Testing upload...');
    const uploadResponse = await fetch('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      headers: {
        'Cookie': `admin-token=${token}`
      },
      body: formData,
    });
    
    console.log('📋 Upload response status:', uploadResponse.status);
    const uploadResult = await uploadResponse.text();
    console.log('📋 Upload response body:', uploadResult);
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
      
      // Now test product creation
      const productData = {
        name: 'Test Product',
        category: 'vapes',
        price: 29.99,
        image: JSON.parse(uploadResult).data.url,
        shortDescription: 'Test product description',
        inStock: true,
        status: 'active'
      };
      
      console.log('📤 Testing product creation...');
      const productResponse = await fetch('http://localhost:3000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `admin-token=${token}`
        },
        body: JSON.stringify(productData),
      });
      
      console.log('📋 Product response status:', productResponse.status);
      const productResult = await productResponse.text();
      console.log('📋 Product response body:', productResult);
      
      if (productResponse.ok) {
        console.log('✅ Product creation successful!');
      } else {
        console.log('❌ Product creation failed');
      }
      
    } else {
      console.log('❌ Upload failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUpload();