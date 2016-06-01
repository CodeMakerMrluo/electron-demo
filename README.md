# electron例子
本项目学习electron的使用。   
每一个分支是一个例子。分支格式是demo01, demo02。后面的分支是基于前面分支的。

# demo01
学会"hello world"。   
electron最基本的文件有三个`package.json`, `index.html`, `main.js`。   
想要运行代码，需要安装`electron-prebuilt`模块。通过`electron`来运行。   
如果安装在全局只需要运行: `electron .`；如果安装在本地需要运行：`./node_modules/.bin/electron .`。   

# demo02
## Main Process && Renderer Process
electron中，由`package.json`中的main脚本跑出来的进程为主进程(Main Process)。当主进程可以创建GUI界面用于显示web页面。     
electron由Chromium负责页面的显示。所以当显示一个页面时，就会有一个对应的渲染进程(Renderer Process)。     
主进程通过创建`BrowserWindow`来创建web显示页面。一个`BrowserWindow`运行在他自己的渲染进程中。当`BrowserWindow`被销毁时，对应的渲染进程也会终止。    
主进程管理着所有的web页面和其对应的渲染进程。与GUI相关的原生接口是不能被渲染进程所调用的。渲染进程通过与主进程通信来获得GUI原生接口的操作。渲染进程与主进程的通信可以使用`ipcRenderr`和`ipcMain`两个模块进行通信。   

## Debuging the Main Process
创建页面后，通过 `win.webContents.openDevTools();`可以调出DevTools工具用于调试Renderer Process。为了能够调试Main Process，Electron提供了`--debug`和`--debug-brk`。   

## 使用VS Code调试Main Process
在VS Code中创建tasks.json文件用于在VS Code中创建`electron .`命令。将其中的`"command"`设为`"electron"`,`"args"`设为`["--debug=5858", "."]`。这样当运行electron时，会以调试的方式进行运行。具体代码见`.vscode/tasks.json`。      
然后创建`launch.json`用于监听Node.js的调试信息。思路就是设置监听5858端口（tasks.json中设置的debug端口）。   
设置完成后，按F5就可以开始调试demo的Main Process。      

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
应用中经常需要菜单来进行快速操作。electron的Main Process中的Menu接口就是用于创建系统菜单和邮件菜单的。
具体代码见例子。

# demo06
系统快捷键使用`globalShortcut`接口。
系统消息使用HTML5的Notification。
任务栏进度使用BrowserWindow.setProgressBar来设置。

# demo07
NativeImage可以用于修改默认图片。
使用Tray可以修改消息栏中的icon和菜单
`app.dock.setIcon`可以设置dock上显示的图片，（demo中一直没有成功）
`app.dock.setBadge`可以对dock上应用图片添加文字描述。



> 页面与系统功能的交互