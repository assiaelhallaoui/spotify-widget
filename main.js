const { app, BrowserWindow, shell, ipcMain} = require("electron");
// app controls the app lifecycle, browserwindow lets us create windows
let win; // rend accessible en dehors de createWindoww ?????
function createWindow() { 
    win = new BrowserWindow ({ 
        width: 400,
        height: 400,
        resizable: true,
        maximizable: false,
        fullscreenable: false,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true, // allows renderer.js to use require() directy -> Node.js APIs
            contextIsolation: false  // disable the security between node and the web page (only good for a project qui me concerne juste moi)
        } 
    });

    win.loadFile("index.html"); 
    win.webContents.openDevTools();

}

ipcMain.on("close-app", () => {
    if (win) win.close();
})

app.whenReady().then(createWindow); // when electron says it finished initalizing we can create windows after
app.on("window-all-closed", () => { 
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});