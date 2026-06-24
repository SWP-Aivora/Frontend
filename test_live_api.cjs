const https = require('https');

const fetchApi = (path) => {
  return new Promise((resolve, reject) => {
    https.get(`https://backend-3a0h.onrender.com${path}`, (res) => {
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
    }).on('error', err => reject(err));
  });
};

async function runTests() {
  console.log('--- BẮT ĐẦU TEST KẾT NỐI API THỰC TẾ ---');
  
  try {
    console.log('1. Đang test API Danh mục (Categories)...');
    const cat = await fetchApi('/api/v1/categories');
    console.log(`-> Status: ${cat.status}`);
    console.log(`-> Dữ liệu:`, cat.status === 200 ? 'Thành công (có data)' : cat.data);

    console.log('\n2. Đang test API Tìm kiếm Chuyên gia (Search Experts)...');
    const search = await fetchApi('/api/v1/profiles/experts/search?keyword=test&page=1&pageSize=5');
    console.log(`-> Status: ${search.status}`);
    console.log(`-> Dữ liệu:`, search.status === 200 ? 'Thành công (có data)' : search.data);

    console.log('\n3. Đang test API Danh sách Job (Get Jobs)...');
    const jobs = await fetchApi('/api/v1/jobs');
    console.log(`-> Status: ${jobs.status}`);
    console.log(`-> Dữ liệu:`, jobs.status === 200 ? 'Thành công (có data)' : jobs.data);

  } catch (error) {
    console.error('Lỗi kết nối:', error);
  }
}

runTests();
