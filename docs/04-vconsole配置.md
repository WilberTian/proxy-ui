# vconsole配置

在移动端调试中，会经常使用到[vconsole](https://github.com/Tencent/vConsole)。

在使用`vconsole`的时候，需要在希望加上`vconsole`的页面上增加下面的代码：

    <script src="path/to/vconsole.min.js"></script>
    <script>
      // init vConsole
      var vConsole = new VConsole();
      console.log('Hello world');
    </script>

为了方便开启`vconsole`功能，Proxy UI中集成了`vconsole`的配置：

![vconsole配置](https://user-images.githubusercontent.com/5880320/64865342-a59ec000-d66b-11e9-8384-5707dee6b2df.jpg)

当“开启”界面中的“vconsole注入”后，代理服务器会拦截所有的`HTML`页面，并在`HTML`代码中注入`vconsole`的资源和启动代码，这样就可以方便的进行移动端的调试了。

