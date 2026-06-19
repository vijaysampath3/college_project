const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Replace hardcoded localhost/127.0.0.1 in services
      if (content.includes("const API_URL = 'http://127.0.0.1:8000/api")) {
        content = content.replace(/const API_URL = 'http:\/\/127\.0\.0\.1:8000\/api(.*?)';/g, "const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}$1`;");
        modified = true;
      }
      if (content.includes("const API_URL = 'http://localhost:8000/api")) {
        content = content.replace(/const API_URL = 'http:\/\/localhost:8000\/api(.*?)';/g, "const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}$1`;");
        modified = true;
      }
      if (content.includes("const BACKEND_URL = 'http://localhost:8000';")) {
        content = content.replace("const BACKEND_URL = 'http://localhost:8000';", "const BACKEND_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';");
        modified = true;
      }

      // Replace in fetch calls (mostly in pages/assessments)
      if (content.includes("http://localhost:8000/api")) {
        // e.g. fetch('http://localhost:8000/api/typing/score'
        content = content.replace(/'http:\/\/localhost:8000\/api(.*?)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}$1`");
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Done!');
