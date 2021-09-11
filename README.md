### extract-apis-webpack-plugins
从项目中提取 apis 的声明生成 apis-keys.d.ts 文件

### 背景
- 每次新定义一个 api 和修改 api 名称需要修改 apis-keys.d.ts 文件，降低了开发效率
- 每次触发 webpack 的 emit 事件必然会修改 apis-keys.d.ts，影响 git 操作
- 项目构建时因为项目打包没有 apis.ts 文件引起报错

### Install
```sh
$ yarn add extract-apis-webpack-plugin --dev
```
或

```bash
$ npm install extract-apis-webpack-plugin --dev
```
### Usage
webpack:
```js
const { ExtractApisPlugin } = require("extract-apis-webpack-plugin")

plugins: [
  new ExtractApisPlugin()
]
```

### Options
```js
/**
 * 要匹配文件的地址
 * default: ['/src/modules', '/src/components']
 */
paths?: string[];

/**
 * 要匹配的文件名
 * default: apis
 */
filename?: string;

/**
 * 输出文件的地址
 * default: /src/types
 */
outputPath?: string;

/**
 * 输出文件名
 * default: apis-keys.d.ts
 */
outputFilename?: string;

/**
 * 是否打印编译错误日志
 */
verbose?: boolean;
```
