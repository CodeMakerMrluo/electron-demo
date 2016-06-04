# electron例子
本项目学习electron的使用。   
每一个分支是一个例子。分支格式是demo01, demo02。后面的分支是基于前面分支的。

# demo01
学会"hello world"。   
electron最基本的文件有三个`package.json`, `index.html`, `main.js`。   
想要运行代码，需要安装`electron-prebuilt`模块。通过`electron`命令来运行。   
如果安装在全局只需要在当前目录运行: `electron .`；如果安装在本地需要运行：`./node_modules/.bin/electron .`。   
具体代码查看demo01分支。

# demo02
了解`Main Process`和`Renderer Process`两者的区别以及如何调试。   
## Main Process && Renderer Process
electron中，由`package.json`中的main脚本跑出来的进程为主进程(Main Process)。在主进程中可以创建GUI界面用于显示web页面。        
electron由Chromium负责页面的显示。当创建一个页面时，就会有一个对应的渲染进程(Renderer Process)。     
主进程通过创建`BrowserWindow`来创建web显示页面（Renderer Process）。一个`BrowserWindow`运行在他自己的渲染进程中。当`BrowserWindow`被销毁时，对应的渲染进程也会终止。    
主进程管理着所有的web页面和其对应的渲染进程。与GUI相关的原生接口是不能被渲染进程直接调用的。渲染进程通过与主进程通信来获得GUI原生接口的操作。渲染进程与主进程的通信可以使用`ipcRenderer`和`ipcMain`两个模块进行通信。     
可以这样理解Main Process和Renderer Process：Main Process就是Node.js的进程；Renderer Process就是Chromium进程。

## 调试Renderer Process
在Main Process中可以通过`win.webContents.openDevTools();`打开指定页面的DevTools调试工具。DevTools的使用和chrome的DevTools调试工具一样，这里不做介绍。

## 调试Main Process
为了能够调试Main Process，Electron提供了`--debug`和`--debug-brk`。为了方便调试，我用VS Code来讲解调试配置。    
在VS Code中创建自定义任务后，会有一个`tasks.json`文件。我们可以创建一个启动electron app的命令。在tasks.json中设置`electron .`命令。核心代码如下：
```
// .vscode/tasks.json
{
  "command": "electron",
  "args": ["."]
}
```
这个时候在VS Code中，按下`cmd + p`会出现命令输入框，输入`task electron`,然后回车，就会执行命令`electron .`。    

接下来配置Node.js调试信息。   
在tasks.json目录下创建文件`launch.json`用于配置调试信息。核心代码如下：
```
// .vscode/launch.json
{
  "configurations": [ {
      "name": "Attach",
      "type": "node",
      "address": "localhost",
      "port": 5858,
      "request": "attach"
    }
  ]
}
```
然后修改tasks.json的文件如下：
```
// .vscode/tasks.json
{
  "command": "electron",
  "args": ["--debug=5858", "."]
}
```
修改tasks.json的原因是为了设置debug端口。   
配置都完成后，先用`task electron`启动app，然后按下F5开始调试。

# demo03
Main Process和Renderer Process由于负责的功能不同，会有需要通信的需要。在electron中，两者的通信可以有两种方法：

## ipcMain 和 ipcRenderer
用于Renderer Process主动向Main Process发送消息。有同步和异步两种方式。具体代码如下：
```
// Renderer Process
const ipcRenderer = require('electron').ipcRenderer;
// 同步消息，会直接打印Main Process返回的信息
console.log(require('electron').ipcRenderer.sendSync(synchronous-message', 'ping'));

// 异步消息，返回信息通过一个新消息传递。
// 监听Main Process的返回信息
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log('asynchronous-reply: %O %O', event, arg);
});
// 发送信息给Main Process
pcRenderer.send('asynchronous-message', 'ping');
```
```
// 监听同步消息
ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = 'pong';  // 返回信息
});

// 监听异步消息
ipcMain.on('asynchronous-message', (event, arg) => {
  event.sender.send('asynchronous-reply', 'pong');  // 以新消息方式返回
});

```

## webContents 和 ipcRenderer
这种方式是Main Process主动向Renderer Process发生消息。
```
// Main Process
// 当页面的加载结束，触发webContents的`did-finish-load`事件，在该事件中向Renderer Process发送信息。
win.webContents.on('did-finish-load', () => {
  win.webContents.send('main-process-messages', 'webContents event "did-finish-load" called');
});
```
```
// Renderer Process
// 监听Main Process中的webContents发送的信息。
ipcRenderer.on('main-process-messages', (event, message) => {
  console.log('message from Main Process: ' , message);  // Prints Main Process Message.
});
```

# demo04
electron提供来webView标签用于加载web页面。通过如下代码可以加载一个taobao页面。
```
<webview src="https://www.taobao.com/" style="display:inline-flex;"></webview>
```
# demo05
应用中经常需要菜单来进行快速操作。electron的Main Process中的`Menu`接口就是用于创建系统菜单和邮件菜单的。   
具体代码见例子。

# demo06
系统快捷键使用`globalShortcut`接口。    
系统消息使用HTML5的`Notification`。   
任务栏进度使用`BrowserWindow.setProgressBar`来设置。

# demo07
NativeImage可以用于设置GUI的图片。   
使用Tray可以修改消息栏中的icon和菜单。   
`app.dock.setIcon`可以设置dock上显示的图片。    
`app.dock.setBadge`可以对dock上应用图片添加文字描述。

# demo08
完成功能后，可以使用`electron-packager`进行打包。electron-packager相关信息可以去[这里](https://github.com/electron-userland/electron-packager)了解。   
基本步骤：
1. 安装`electron-packager`到全局
2. 使用命令`electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> [optional flags...]`对sourcedir进行打包。其中platform有`darwin`, `linux`, `mas`, `win32`几种情况，arch有`ia32`, `x64`两种情况。
注意：
1. 打包后路径不能再使用相对路径，需要改成"`${__dirname}\images\img.png`"。
2. package.json中的`productName`可以直接指定打包后的名字。
