const fs = require('fs');
const path = require('path');

console.log("🚀 Starting Gramin Bharat TV Vercel Build Process...");

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy directories
copyDirSync(path.join(__dirname, 'css'), path.join(distDir, 'css'));
copyDirSync(path.join(__dirname, 'js'), path.join(distDir, 'js'));
copyDirSync(path.join(__dirname, 'assets'), path.join(distDir, 'assets'));
copyDirSync(path.join(__dirname, 'videos'), path.join(distDir, 'videos'));

// Copy root files
const rootFiles = ['index.html', 'admin.html', 'server.js', '.htaccess'];
rootFiles.forEach(file => {
  const srcFile = path.join(__dirname, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(distDir, file));
  }
});

console.log("✅ Build complete! All files copied to dist/ directory.");
