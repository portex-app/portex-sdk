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
    }
  });

  // 写入压缩后的文件
  fs.writeFileSync(path.join(distDir, 'portex-sdk.min.js'), minified.code);
  console.log('Minified code saved to portex-sdk.min.js');
})();

// 复制测试页面
console.log('Copying test page...');
const testPagePath = path.join(__dirname, '../test/index.html');
const testPageContent = fs.readFileSync(testPagePath, 'utf8');
// 修改SDK引用路径
const updatedTestPageContent = testPageContent.replace(
  'src="../dist/portex-sdk.js"',
  'src="portex-sdk.min.js"'
);
fs.writeFileSync(path.join(distDir, 'index.html'), updatedTestPageContent);

console.log('Bundle created successfully!'); 