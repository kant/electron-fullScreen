import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import './styles/index.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import Router from './router';

ReactDOM.render(
	<React.StrictMode>
		<HashRouter>
			<Router />
		</HashRouter>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
