const request = require('supertest');
const path = require('path');
const fs = require('fs');
const server = require('../server');
import { act, waitFor } from 'react';
import { render } from 'react-dom';
const { AuthProvider } = require('../contexts/AuthContext');
const { CartProvider } = require('../contexts/CartContext');
const { AdminPanel } = require('../components/AdminPanel');
const userEvent = require('@testing-library/user-event');
const axios = require('axios');

describe('Server API Tests', () => {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  beforeAll(() => {
    // Create a test image file
    fs.writeFileSync(testImagePath, 'test image content');
  });

  afterAll(() => {
    // Clean up test image file
    fs.unlinkSync(testImagePath);
  });

  it('should handle file upload', async () => {
    const response = await request(server)
      .post('/upload')
      .attach('image', testImagePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('imageUrl');
    expect(response.body.imageUrl).toMatch(/^\/uploads\/\d+-test-image\.png$/);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    }, { timeout: 3000 });

    expect(
      (axios.post as jest.Mock).mock.calls.some(
        ([url]) => url === 'http://localhost:3001/products'
      )
    ).toBe(true);
  });

  it('should reject non-image files', async () => {
    const response = await request(server)
      .post('/upload')
      .attach('image', path.join(__dirname, 'test.txt'));

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should reject files larger than 5MB', async () => {
    // Create a large file
    const largeFilePath = path.join(__dirname, 'large-image.png');
    const largeFileContent = Buffer.alloc(6 * 1024 * 1024); // 6MB
    fs.writeFileSync(largeFilePath, largeFileContent);

    const response = await request(server)
      .post('/upload')
      .attach('image', largeFilePath);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('File size too large');

    // Clean up
    fs.unlinkSync(largeFilePath);
  });

  it('should serve static files', async () => {
    const response = await request(server)
      .get('/uploads/test-image.png');

    expect(response.status).toBe(200);
  });
});

describe('Admin Panel Tests', () => {
  it('should render correctly', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <CartProvider>
            <AdminPanel />
          </CartProvider>
        </AuthProvider>
      );
    });
  });

  it('should handle form field interactions', async () => {
    await act(async () => {
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Test Product');
      // ... similar for other fields
    });
  });
}); 