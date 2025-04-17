const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { minify } = require('terser');

// 确保输出目录存在
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 编译TypeScript
console.log('Compiling TypeScript...');
execSync('tsc', { stdio: 'inherit' });

// 读取telegram-web-app.js的内容
const telegramWebAppPath = path.join(__dirname, '../lib/telegram-web-app.js');
const telegramWebAppContent = fs.readFileSync(telegramWebAppPath, 'utf8');


// 读取编译后的SDK文件
const sdkPath = path.join(distDir, 'portex-sdk.js');
const sdkContent = fs.readFileSync(sdkPath, 'utf8');

// 合并内容并添加模块系统包装
const content = `
(function(root) {
  var modules = {};
  var define = function(name, deps, callback) {
    modules[name] = { deps: deps, callback: callback };
  };
  var require = function(name) {
    if (!modules[name]) {
      throw new Error('Module ' + name + ' not found');
    }
    if (!modules[name].exports) {
      var exports = {};
      var module = { exports: exports };
      var deps = modules[name].deps.map(function(dep) {
        if (dep === 'exports') return exports;
        if (dep === 'require') return require;
        return require(dep);
      });
      modules[name].callback.apply(null, deps);
      modules[name].exports = module.exports;
    }
    return modules[name].exports;
  };

  // Telegram Web App
  ${telegramWebAppContent}

  // Portex SDK
  ${sdkContent}

  var sdk = require('index');
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = sdk.Portex;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return sdk.Portex; });
  } else {
    root.Portex = sdk.Portex;
  }
})(typeof self !== 'undefined' ? self : this);
`;

// 写入未压缩的文件
fs.writeFileSync(sdkPath, content);

// 压缩代码
console.log('Minifying code...');
(async () => {
  const minified = await minify(content, {
    compress: {
      drop_console: true,
      pure_funcs: ['console.log']
    },
    mangle: true,
    format: {
      comments: false
    },
    sourceMap: {
      filename: 'portex-sdk.min.js',
      url: 'portex-sdk.min.js.map',
      includeSources: true
    }
  });

  // 写入压缩后的文件
  fs.writeFileSync(path.join(distDir, 'portex-sdk.min.js'), minified.code);
  // 写入 SourceMap 文件
  fs.writeFileSync(path.join(distDir, 'portex-sdk.min.js.map'), minified.map);
  console.log('Minified code and source map saved');
})();

// 复制测试页面
console.log('Copying test page...');
const testPagePath = path.join(__dirname, '../test/index.html');
const testPageContent = fs.readFileSync(testPagePath, 'utf8');
// 修改SDK引用路径
const updatedTestPageContent = testPageContent.replace(
  'src="../dist/portex-sdk.min.js"',
  'src="portex-sdk.min.js"'
).replace(
  'src="../dist/portex-sdk.js"',
  'src="portex-sdk.js"'
);
fs.writeFileSync(path.join(distDir, 'index.html'), updatedTestPageContent);

/**
 * 复制目录及其内容
 * @param {string} src 源目录路径
 * @param {string} dest 目标目录路径
 */
function copyDirectory(src, dest) {
  // 确保目标目录存在
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制 docs 目录到 dist 目录
console.log('Copying docs...');
const docsDir = path.join(__dirname, '../docs');
const distDocsDir = path.join(distDir, 'docs');
try {
  copyDirectory(docsDir, distDocsDir);
} catch (error) {
  console.error('Error copying docs:run pnpm doc first');
}

// 复制测试资源目录
console.log('Copying test assets...');
const testAssetsDir = path.join(__dirname, '../test/assets');
const distTestAssetsDir = path.join(distDir, 'assets');
copyDirectory(testAssetsDir, distTestAssetsDir);

console.log('Bundle created successfully!'); 