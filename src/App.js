import React from 'react';
import logo from './logo.svg';
import './App.css';
import './component/searchform/SearchForm'
import SearchForm from './component/searchform/SearchForm';
import Map from './component/map/Map'
import CardForm from './component/cards/cardform/CardForm';
import { Provider } from 'react-redux';
import store from './app/store';
import Cards from './component/cards/Cards'

function App() {
	return (
		<Provider store={store}>
			<div className="App">
				<header className="App-header">
					<div className="logo">
						<img src={logo} className="App-logo" alt="logo" />
						<p>Location Search</p>
					</div>
				</header>
				<div>
					<SearchForm></SearchForm>
				</div>
				<div className="bodycontainer">
					<Cards className="cards" />
					<div className='map'>
						<Map />
					</div>
				</div>
				<footer className="App-footer">
					<div className="logo">
						<img src={logo} className="App-logo" alt="logo" />
						<p className="logo">Location Search</p>
					</div>
				</footer>
			</div>
		</Provider>
	);
}

export default App;
