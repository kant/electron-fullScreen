import { Route } from 'react-router-dom';
import Home from './pages/home';

function Router() {
	return <Route exact path='/' component={Home} />;
}

export default Router;
