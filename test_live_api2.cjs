const https = require('https');

const fetchApi = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'backend-3a0h.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- ĐANG CHẠY TEST CÁC NGHIỆP VỤ KHÁC ---');
  
  try {
    console.log('\n1. Test Nghiệp vụ Auth (Đăng nhập sai pass để xem BE có phản hồi 400 hay 500)...');
    const auth = await fetchApi('POST', '/api/v1/auth/login', { email: "test@test.com", password: "wrongpassword123" });
    console.log(`-> Status: ${auth.status}`);
    console.log(`-> Dữ liệu:`, auth.data);

    console.log('\n2. Test Nghiệp vụ Tin nhắn (Lấy list conversation khi chưa đăng nhập - kỳ vọng 401 Unauthorized)...');
    const msg = await fetchApi('GET', '/api/v1/conversations');
    console.log(`-> Status: ${msg.status}`);
    console.log(`-> Dữ liệu:`, msg.data);

    console.log('\n3. Test Nghiệp vụ Thanh toán (Lấy lịch sử thanh toán - kỳ vọng 401)...');
    const payment = await fetchApi('GET', '/api/v1/payments/history');
    console.log(`-> Status: ${payment.status}`);
    console.log(`-> Dữ liệu:`, payment.data);
    
    console.log('\n4. Test Nghiệp vụ Sinh nội dung AI (POST /api/v1/ai/service-generator)...');
    const ai = await fetchApi('POST', '/api/v1/ai/service-generator', { prompt: "Test" });
    console.log(`-> Status: ${ai.status}`);
    console.log(`-> Dữ liệu:`, ai.data);

  } catch (error) {
    console.error('Lỗi kết nối nghiêm trọng:', error);
  }
}

runTests();
