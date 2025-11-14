// Test script to verify property API calls from frontend
import api from './api';
import propertyClient from './api/propertyClient';

// Test the property client functions
async function testPropertyAPI() {
  try {
    console.log('Testing property API functions...');
    
    // Test getMyProperties
    console.log('\n--- Testing getMyProperties ---');
    try {
      const myProperties = await propertyClient.getMyProperties();
      console.log('getMyProperties successful:', Array.isArray(myProperties) ? myProperties.length : 'Response received');
    } catch (error) {
      console.error('getMyProperties failed:', error.message);
    }
    
    // Test getAll
    console.log('\n--- Testing getAll ---');
    try {
      const allProperties = await propertyClient.getAll();
      console.log('getAll successful:', allProperties.properties?.length || 'Response received');
    } catch (error) {
      console.error('getAll failed:', error.message);
    }
    
    console.log('\nProperty API test completed!');
  } catch (error) {
    console.error('Test error:', error);
  }
}

testPropertyAPI();