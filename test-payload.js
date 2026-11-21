// Test API directly to see error
const testPayload = {
  experienceConfig: {
    themeConfig: {
      colors: {
        brand: {
          primary: "#FF0000"
        }
      }
    }
  }
};

console.log("Test payload:", JSON.stringify(testPayload, null, 2));
