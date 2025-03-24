// 这个文件可以为空，因为我们直接从源代码导入模块
export {};

declare global {
  namespace NodeJS {
    interface Global {
      portex: any;
    }
  }
}

// 模拟全局环境
(global as any).portex = require('../dest/portex-sdk.js'); 