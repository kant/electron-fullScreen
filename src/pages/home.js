import { Layout, Typography, Input, Switch, Button, Spin, Alert } from 'antd';
import { Row, Col } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import isElectron from 'is-electron';
import { LoadingOutlined } from '@ant-design/icons';

const { ipcRenderer } = window;
const { Content } = Layout;

const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;
if (localStorage.getItem('engine') === null) {
	window.localStorage.setItem('engine', true);
}
let settingEngine = window.localStorage.getItem('engine') === 'true' ? true : false;

const Home = () => {
	const [value, setValue] = useState(''); // 검색
	const [engine, setEngine] = useState('Google'); // 검색 엔진
	const [engineType, setEngineType] = useState(settingEngine); // 검색 엔진 값
	const [engineColor, setEngineColor] = useState('#4081ec'); // 검색 엔진 색상
	const [loading, setLoading] = useState(true); // 로딩
	const [version, setVerion] = useState(''); // 프로그램 버전
	const [content, setContent] = useState(''); // 업데이트 상태

	const textRef = useRef();
	// ------------------------------------------------------------------------------------------------------------------------------------------------------
	let timer;
	// 커스텀 스타일
	const StyledDiv = styled.div`
		-webkit-user-select: none;
		-webkit-app-region: no-drag;
		.Google {
			background: linear-gradient(
				to right,
				#4081ec 0%,
				#4081ec 21%,
				#e34133 21%,
				#e34133 40%,
				#f3b605 40%,
				#f3b605 57%,
				#4081ec 57%,
				#4081ec 75%,
				#32a350 75%,
				#32a350 83%,
				#e34133 83%,
				#e34133 100%
			);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			font-weight: bold;
		}
		.NAVER {
			color: ${engineColor} !important;
			font-weight: bold;
		}
		.search {
			&:hover {
				border-color: ${engineColor} !important;
			}
		}
		.ant-input-affix-wrapper:focus,
		.ant-input-affix-wrapper-focused {
			border-color: ${engineColor} !important;
			-webkit-box-shadow: 0 0 0 2px rgba(255, 185, 0, 0.2) !important;
			box-shadow: 0 0 0 2px rgba(255, 185, 0, 0.2) !important;
		}
		.ant-menu.ant-menu-dark .ant-menu-item-selected,
		.ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
			background-color: ${engineColor} !important;
		}
		.ant-menu-dark.ant-menu-horizontal > .ant-menu-item:hover {
			background-color: ${engineColor} !important;
		}

		.ant-switch {
			font-weight: 600;
			background-color: #03c75a !important;
		}
		.ant-switch-checked {
			background-color: #4081ec !important;
		}
	`;
	const StyleButton = styled.div`
		-webkit-app-region: drag;
		position: absolute;
		top: 0;
		left: 0;
		text-align: right;
		background-color: ${engineColor};
		button {
			-webkit-app-region: no-drag;
			color: #f0f2f5;
			padding: 0 0.75rem !important;
			&:hover {
				background: none !important;
			}
		}
	`;
	const StyledLabel = styled.label`
		color: ${engineColor};
		font-weight: 600;
	`;
	const StyledSpin = styled(Spin)`
		max-height: 100% !important;
		font-weight: bold;
		color: ${engineColor};
		.ant-spin-dot-item {
			background-color: ${engineColor};
		}
	`;
	const StyledAlert = styled(Alert)`
		width: fit-content;
		margin: auto;
		color: ${engineColor};
		background-color: #fff;
		border: none;
	`;
	// 검색 입력 이벤트
	const searchHandler = (e) => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(function () {
			setValue(e.target.value);
			textRef.current.focus();
		}, 2000);
	};
	// 검색 엔터 이벤트
	const searchEnterHandler = (e) => {
		const value = e.target.value;
		if (urlCheck(value)) {
			const new_value = value.replace(/^(http[s]?:\/\/){0,1}(www\.){0,1}[\.]{0,1}/, '');
			window.open(`http://${new_value}`);
		} else {
			if (engineType) {
				// Google
				window.open(`https://www.google.com/search?q=${value}`);
			} else {
				// Naver
				window.open(`https://search.naver.com/search.naver?query=${value}`);
			}
		}
	};
	// 검색엔진 변경 함수
	const chnageSwitchHandler = () => {
		setEngineType(!engineType);
		window.localStorage.setItem('engine', !engineType);
	};
	// URL 체크 함수
	const urlCheck = (value) => {
		var pattern = new RegExp(
			'^(https?:\\/\\/)?' + // protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
				'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
				'(\\#[-a-z\\d_]*)?$',
			'i'
		); // fragment locator
		return !!pattern.test(value);
	};
	// 검색엔진 변경
	useEffect(() => {
		if (engineType) {
			setEngine('Google');
			setEngineColor('#4081ec');
			setEngineType(true);
		} else {
			setEngine('NAVER');
			setEngineColor('#03c75a');
			setEngineType(false);
		}
	}, [engineType]);
	// 업데이트 상태 변경
	useEffect(() => {
		if (window.performance.navigation.type === 1) {
			setLoading(false);
		}
		if (isElectron()) {
			ipcRenderer.on('message', function (event, status) {
				switch (status) {
					case 'dev':
					case 'update-not-available':
						setLoading(false);
						break;
					case 'update_availabl':
						setContent('업데이트 파일을 다운로드 중입니다...');
						break;
					case 'update-downloaded':
						setContent('업데이트 파일 다운로드가 완료되었습니다. 잠시 후 재시작됩니다.');
						break;
					default:
						break;
				}
			});
		}
		// 프로그램 버전 호출
		if (!loading) {
			ipcRenderer.send('app_version');
			ipcRenderer.on('app_version', (event, arg) => {
				ipcRenderer.removeAllListeners('app_version');
				setVerion(arg.version);
			});
		}
	}, [content, loading]);

	return (
		<StyledSpin size='large' tip={<StyledAlert message='업데이트 확인 중...' description={content} type='info' />} spinning={loading} indicator={antIcon}>
			<Layout className='layout'>
				<Content style={{ height: '100%', margin: '24px 16px', padding: 24 }}>
					<StyleButton style={{ width: '100%' }}>
						<Button
							type='text'
							icon={<CloseOutlined />}
							size='large'
							onClick={() => {
								window.close();
							}}
						/>
					</StyleButton>
					<Row justify='space-around' align='middle' style={{ height: '100%' }}>
						<Col span={24}>
							<StyledDiv>
								<Typography.Title style={{ textAlign: 'center', width: 'fit-content', margin: 'auto', padding: '1rem 0', fontSize: '80px' }} className={engine}>
									{engine}
								</Typography.Title>
								<div style={{ textAlign: 'center' }}>
									<Switch checkedChildren='Google' unCheckedChildren='NAVER' checked={engineType} style={{ margin: '8px 0 16px 0' }} onChange={chnageSwitchHandler} />
								</div>
								<div className='site-layout-content'>
									<Input
										id='search'
										className='search'
										size='large'
										prefix={<SearchOutlined />}
										defaultValue={value}
										onChange={searchHandler}
										onPressEnter={searchEnterHandler}
										ref={textRef}
									/>
								</div>
							</StyledDiv>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<StyledLabel>Version : {version}</StyledLabel>
						</Col>
					</Row>
				</Content>
			</Layout>
		</StyledSpin>
	);
};
export default Home;
