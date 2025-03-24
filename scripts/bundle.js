const fs = require('fs');
const path = require('path');

// 读取编译后的文件
const sdkPath = path.join(__dirname, '../dest/portex-sdk.js');
let content = fs.readFileSync(sdkPath, 'utf8');

// 修复模块路径
content = content.replace(/define\("packages\//g, 'define("');

// 添加模块系统兼容包装
const wrapper = `
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

  ${content}

  var sdk = require('index');
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = sdk;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return sdk; });
  } else {
    root.PortexSDK = sdk.PortexSDK;
  }
})(typeof self !== 'undefined' ? self : this);
`;

// 写入文件
fs.writeFileSync(sdkPath, wrapper);

console.log('Bundle created successfully!'); 