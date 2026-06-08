const fs = require('fs');

const files = [
  'src/features/admin/pages/AdminDashboardPage.tsx',
  'src/features/admin/pages/UserManagementPage.tsx'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Radii
  content = content.replace(/rounded-\[32px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[30px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[28px\]/g, 'rounded-xl');
  content = content.replace(/rounded-\[26px\]/g, 'rounded-xl');

  // Padding
  content = content.replace(/p-8/g, 'p-5');
  content = content.replace(/p-6/g, 'p-4');
  content = content.replace(/lg:p-8/g, 'lg:p-5');
  content = content.replace(/lg:p-6/g, 'lg:p-4');

  // Table padding
  content = content.replace(/px-8/g, 'px-4');
  content = content.replace(/py-5/g, 'py-3');
  content = content.replace(/px-6/g, 'px-4');
  content = content.replace(/py-4/g, 'py-2.5');
  
  // Header padding
  content = content.replace(/py-3/g, 'py-2');

  // Gap and margin
  content = content.replace(/gap-8/g, 'gap-5');
  content = content.replace(/gap-6/g, 'gap-4');
  content = content.replace(/space-y-8/g, 'space-y-5');
  content = content.replace(/space-y-6/g, 'space-y-4');
  content = content.replace(/mb-6/g, 'mb-4');

  // Heights - use content-based height to prevent stretching empty space
  content = content.replace(/h-full/g, 'h-fit');
  
  // Prevent breaking the layout full heights
  content = content.replace(/h-fit flex items-center justify-center/g, 'h-full flex items-center justify-center');
  content = content.replace(/h-fit w-full/g, 'h-full w-full');
  content = content.replace(/h-\[60vh\]/g, 'h-[50vh]');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Update complete.');
