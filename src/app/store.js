// store.js
import { legacy_createStore as createStore } from 'redux';

const initialState = {
	zipcode: null,
	radius: null,
	searchResults: null,
	leftlat: null,
	leftlng: null,
	rightlat: null,
	rightlng: null,
};

const Search = (state = initialState, action) => {
	switch (action.type) {
		case 'OnSearch':
			return {
				...state,
				zipcode: action.payload.zipcode,
				radius: action.payload.radius,
			};
		case 'MakeCard':
			return {
				...state,
				searchResults: action.payload.searchResults,
			};
		case 'LeftClick':
			return {
				...state,
				leftlat: action.payload.leftlat,
				leftlng: action.payload.leftlng,
			};
		case 'RightClick':
			return {
				...state,
				rightlat: action.payload.rightlat,
				rightlng: action.payload.rightlng,
			};
		default:
			return state;
	}
};

const store = createStore(Search);

export default store;
