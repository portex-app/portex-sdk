const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 确保输出目录存在
const destDir = path.join(__dirname, '../dest');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 编译TypeScript
console.log('Compiling TypeScript...');
execSync('tsc', { stdio: 'inherit' });

// 读取telegram-web-app.js的内容
const telegramWebAppPath = path.join(__dirname, '../lib/telegram-web-app.js');
const telegramWebAppContent = fs.readFileSync(telegramWebAppPath, 'utf8');

// 读取编译后的SDK文件
const sdkPath = path.join(destDir, 'portex-sdk.js');
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

// 写入最终文件
fs.writeFileSync(sdkPath, content);

// 复制测试页面到dest目录
console.log('Copying test page...');
const testPagePath = path.join(__dirname, '../test/index.html');
const testPageContent = fs.readFileSync(testPagePath, 'utf8');
// 修改SDK引用路径
const updatedTestPageContent = testPageContent.replace(
  'src="../dest/portex-sdk.js"',
  'src="portex-sdk.js"'
);
fs.writeFileSync(path.join(destDir, 'index.html'), updatedTestPageContent);

console.log('Bundle created successfully!'); 