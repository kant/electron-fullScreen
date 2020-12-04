# Electron FullScreen

PC에 특정 프로그램으로 인해 브라우저의 전체화면 제약이 걸렸다.

따라서 Youtbue와 같은 동영상을 전체화면으로 볼 수 없었다.

Window, Mac 환경은 다르기에 각각 OS에서 Build 해야한다.

### 사용 패키지

    "@ant-design/icons": "^4.3.0"
    "antd": "^4.8.5",

    "electron-is-dev": "^1.2.0",
    "electron-log": "^4.3.0",
    "electron-updater": "^4.3.5",
    "is-electron": "^2.2.0",

    "react(CRA)": "^17.0.1",
    "react-router-dom": "^5.2.0",
    "styled-components": "^5.2.1",

    # devDependencies

    "concurrently": "^5.3.0",
    "cross-env": "^7.0.2",
    "electron": "^11.0.2",
    "electron-builder": "^22.9.1",
    "wait-on": "^5.2.0"

---

### `Now Version : 1.0.2`

# Patch Note

1.0.2 : 단축어 기능 변경<br/>

- Ctrl + Function : DevTools 열기
  - 정상적으로 DevTools를 열 수 없었다. setDevToolsWebContents를 통해 열 수 있도록 함.
  
- Ctrl + A, Ctrl + R : 사용불가

1.0.1 : log 기능 추가<br/>

- electron-log 추가,  사용자/AppData/Roaming/full-screen/logs에 저장

1.0.0 : 최초 오픈<br/>

- electron-updater는 NsisUpdater.js 파일에서 callUsingElevation() 함수 강제실행 한다. 프로그램이 자동 업데이트 이후 재실행되지 않아서 적용함.
