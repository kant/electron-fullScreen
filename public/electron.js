const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, remote } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');

let win, tray;
const gotTheLock = app.requestSingleInstanceLock();

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// React로 보낼 메시지 함수
function sendStatusToReact(text) {
	win.webContents.send('message', text);
}

if (!gotTheLock) {
	log.debug('App ending...');
	app.quit();
	app.exit();
} else {
	app.on('second-instance', async (event, commandLine, workingDirectory) => {
		if (win) {
			if (win.isMinimized()) {
				win.restore();
			} else if (!win.isVisible()) {
				win.show();
			}
			win.focus();
		}
	});

	//처음 실행시
	app.whenReady().then(() => {
		createWindow();
		autoUpdater.checkForUpdatesAndNotify();

		app.on('activate', function () {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});
	});

	app.on('window-all-closed', function () {
		if (process.platform !== 'darwin') {
			app.quit();
			app.exit();
		}
	});
	// 업데이트가 필요 할 시
	autoUpdater.on('update-available', () => {
		sendStatusToReact('update_available');
	});
	// 업데이트가 필요 없을 시
	autoUpdater.on('update-not-available', (info) => {
		sendStatusToReact('update-not-available');
	});
	// 업데이트 파일 다운로드
	autoUpdater.on('update-downloaded', (info) => {
		sendStatusToReact('update-downloaded');
		// 서비스 재시작
		setTimeout(() => {
			autoUpdater.quitAndInstall();
		}, 8000);
	});
	// 업데이트 파일 다운로드 중 오류
	autoUpdater.on('error', (err) => {
		dialog.showErrorBox('Error', '자동 업데이트를 실패하였습니다.', () => {
			app.quit();
		});
	});
	// 버전 체크
	ipcMain.on('app_version', () => {
		log.info('app_version : ', app.getVersion());
		win.webContents.send('app_version', { version: app.getVersion() });
	});
	// 개발자 도구
	ipcMain.on('open_DevTools', async () => {
		log.info('open_DevTools');
		log.info('remote');
		remote.getCurrentWindow().toggleDevTools();

		log.info('brower');
		let devtools = new BrowserWindow();
		win.webContents.setDevToolsWebContents(devtools.webContents);
		win.webContents.openDevTools({ mode: 'detach' });
	});
	ipcMain.on('app_quit', async () => {
		log.info('App Ending...');
		app.quit();
	});
}

const createWindow = () => {
	win = new BrowserWindow({
		minWidth: 800,
		height: 600,
		center: true,
		frame: false,
		icon: path.join(__dirname, '../build/favicon.ico'),
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			preload: path.join(__dirname, './preload.js'),
		},
	});

	// 트레이 생성
	createTray();

	if (isDev) {
		// 개발 중에는 개발 도구에서 호스팅하는 주소에서 로드
		win.loadURL('http://localhost:3000');
	} else {
		// 프로덕션 환경에서는 패키지 내부 리소스에 접근
		win.loadFile(path.join(__dirname, '../build/index.html'));
	}
	win.on('ready-to-show', () => {
		if (isDev) {
			sendStatusToReact('dev');
		}
	});
	//메인 BrowserWindow에서 닫기를 누를시 히든처리가 선행되어야함.
	win.on('close', (event) => {
		event.preventDefault();
		win.hide();
	});
	win.on('hide', () => {
		win.webContents.closeDevTools();
	});

	win.webContents.on('new-window', (event, url) => {
		event.preventDefault();
		win.hide();
		newWindow(url);
	});
};

// 테스트 완료 후 삭제
const createTray = () => {
	// Tray 생성
	tray = new Tray(path.join(__dirname, '../build/favicon.ico'));

	tray.on('double-click', () => {
		win.show();
	});

	// Tray 메뉴
	var contextMenu = Menu.buildFromTemplate([
		{
			label: '종료',
			click: function () {
				win.close();
				app.quit();
				app.exit();
			},
		},
	]);
	tray.setContextMenu(contextMenu);
};

// New Window
const newWindow = (url) => {
	const outsideLink = new BrowserWindow({
		width: 1280,
		height: 720,
		center: true,
		icon: path.join(__dirname, '../build/favicon.ico'),
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
		},
	});
	outsideLink.setMenuBarVisibility(false);
	outsideLink.loadURL(url);

	outsideLink.once('ready-to-show', () => {
		outsideLink.focus();
	});
	outsideLink.webContents.on('new-window', (event, url) => {
		event.preventDefault();
		newWindow(url);
	});
	outsideLink.webContents.on('devtools-opened', () => {
		outsideLink.webContents.closeDevTools();
	});
};
