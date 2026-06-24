const https = require('https');

const fetchApi = (path) => {
  return new Promise((resolve, reject) => {
    https.get(`https://backend-3a0h.onrender.com${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    }).on('error', err => reject(err));
  });
};

async function run() {
  const paths = [
    '/swagger/v1/swagger.json',
    '/api-docs/swagger.json',
    '/swagger.json',
    '/v1/api-docs'
  ];
  
  for (const p of paths) {
    const res = await fetchApi(p);
    if (res.status === 200) {
      console.log(`Found Swagger at ${p}!`);
      // Lọc nhanh ra danh sách đường dẫn (paths)
      try {
        const json = JSON.parse(res.data);
        const allPaths = Object.keys(json.paths);
        console.log("CÁC ĐƯỜNG DẪN LIÊN QUAN ĐẾN PROPOSAL VÀ PROJECT:");
        console.log(allPaths.filter(url => url.includes('proposal') || url.includes('project')).join('\n'));
        return;
      } catch(e) {
        console.log('Not valid JSON');
      }
    }
  }
  console.log('Không tìm thấy Swagger JSON online.');
}

run();
