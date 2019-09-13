# proxy-ui

一个基于Anyproxy的图形化代理工具，支持代理规则的创建、保存和分组。

同时集成了vconsole和weinre，支持移动端的调试。


# 本地开发和构建

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# lint all JS/Vue component files in `src/`
npm run lint

```

# 功能和使用


## 功能

Proxy UI是基于Anyproxy的一个代理工具，可以通过图形化的方式支持以下功能：

1. 配置、启动以及停止代理服务器
2. 创建代理规则，通过Proxy UI可以创建下面四种代理规则

    - Mock响应：请求不会发送到服务器，代理服务器直接返回Mock数据作为响应
    - 修改请求：修改请求数据，并发送的服务器
    - 修改响应：请求发送到服务器，代理服务器收到响应数据后进行处理，然后返回
    - 自定义规则：支持通过编程的方式自定义代理规则

3. 代理规则的导入和导出
4. 设置HTML页面是否自动注入vconsole
5. 开启weinre服务器，并在HTML页面中自动注入weinre脚本

详细的使用，可以参考“使用文档”。


## 使用文档

1. [代理规则管理](https://github.com/WilberTian/proxy-ui/blob/master/docs/01-%E4%BB%A3%E7%90%86%E8%A7%84%E5%88%99%E7%AE%A1%E7%90%86.md)
2. [创建代理规则](https://github.com/WilberTian/proxy-ui/blob/master/docs/02-%E5%88%9B%E5%BB%BA%E4%BB%A3%E7%90%86%E8%A7%84%E5%88%99.md)
3. [代理服务器配置](https://github.com/WilberTian/proxy-ui/blob/master/docs/03-%E4%BB%A3%E7%90%86%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE.md)
4. [vconsole配置](https://github.com/WilberTian/proxy-ui/blob/master/docs/04-vconsole%E9%85%8D%E7%BD%AE.md)
5. [weinre配置](https://github.com/WilberTian/proxy-ui/blob/master/docs/05-weinre%E9%85%8D%E7%BD%AE.md)


# License

MIT


# FYI

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
