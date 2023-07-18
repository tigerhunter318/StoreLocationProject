import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import './styles.css';
import { useDispatch } from 'react-redux';
import jsondata from '../data.json'

const SearchForm = () => {
	const [zipcode, setzipcode] = React.useState('');
	const [radius, setRadius] = React.useState('');
	const [leftlat, setLeftLat] = React.useState('');
	const [leftlng, setLeftLng] = React.useState('');
	const dispatch = useDispatch();

	const handleRadiusChange = (event) => {
		setRadius(event.target.value);
	};

	const handlezipcodeChange = (event) => {
		setzipcode(event.target.value);
	};

	const handleSearchButton = () => {
		setLeftLat(0); setLeftLng(0);
		if (zipcode === '' || !(/^\d{5}$/.test(zipcode))) alert('Invalid ZipCode');
		else {
			dispatch({ type: 'OnSearch', payload: { zipcode, radius } });
			dispatch({ type: 'LeftClick', payload: { leftlat, leftlng } });
		}
	};

	const handleResetButton = () => {
		// Add your reset functionality here
		setzipcode('');
		setRadius('');
		dispatch({ type: 'OnSearch', payload: { zipcode, radius } });
	};

	return (
		<div className="searchform">
			<p className="title">Input Zip Code and select radius.</p>
			<div className="inputform">
				<input
					type="text"
					placeholder="Your Zip Code here..."
					className="input"
					value={zipcode}
					onChange={handlezipcodeChange}
				/>
				<Box sx={{ minWidth: 200 }} className="dropdown">
					<FormControl fullWidth>
						<InputLabel id="demo-simple-select-label">Radius</InputLabel>
						<Select
							labelId="demo-simple-select-label"
							id="demo-simple-select"
							value={radius}
							label="Radius"
							onChange={handleRadiusChange}
						>
							<MenuItem value={10}>10 miles</MenuItem>
							<MenuItem value={25}>25 miles</MenuItem>
							<MenuItem value={50}>50 miles</MenuItem>
							<MenuItem value={75}>75 miles</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Button onClick={handleSearchButton} className="button_search">Search</Button>
				<Button onClick={handleResetButton} className="button_reset">Reset</Button>
			</div>
		</div>
	);
};

export default SearchForm;
