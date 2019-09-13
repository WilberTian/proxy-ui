# weinre配置

在移动端调试中，还有一个常用的工具就是[weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/Home.html)，但是`weinre`的配置、使用还是比较麻烦的。

因此，Proxy UI中就集成`weinre`的配置、启动，方便通过Proxy UI来使用`weinre`进行移动端的调试。

`weinre`的配置，目前只暴露了端口号的配置：

![weinre配置](https://user-images.githubusercontent.com/5880320/64865347-a899b080-d66b-11e9-84c5-46f463cfdbff.jpg)

当开启`weinre`之后，就会出现`weinre`日志Tab，用来显示`weinre`的日志信息：

![weinre日志](https://user-images.githubusercontent.com/5880320/64865350-a9324700-d66b-11e9-8720-612b44318a91.jpg)

当`weinre`启动成功后，就可以通过配置的`weinre`端口来查看`weinre`页面了：

![weinre界面](https://user-images.githubusercontent.com/5880320/64865351-a9cadd80-d66b-11e9-97c6-13cbb7708e81.jpg)

当通过Proxy UI启动代理服务器，并且开启`weinre`后，代理服务器会拦截所有的`HTML`页面，并在`HTML`代码中注入`weinre`的目标脚本，来支持远程查看了

    <script src="http://localhost:8787/target/target-script-min.js#anonymous"></script>