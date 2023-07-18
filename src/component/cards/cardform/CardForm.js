import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import './styles.css'
import { useDispatch } from 'react-redux';


const CardForm = (props) => {
	const { address, city, state, zipcode, hours, distance, lat, lng, attribute} = props;
	const dispatch = useDispatch();
	const [leftlat, setLeftLat] = React.useState('');
	const [leftlng, setLeftLng] = React.useState('');

	const handleButton = () => {
		setLeftLat(lat); setLeftLng(lng);
	};

	useEffect(() => {
		dispatch({ type: 'LeftClick', payload: { leftlat, leftlng } });
	  }, [leftlat, leftlng]);

	let name = 'card';
	if(attribute === 1) name = 'card border';

	return (
        <Card className={name}>
            <p className='address'>{address}</p>
            <div class="container">
                <div class="text">City: {city}</div>
                <div class="mile">{distance} mi away</div>
                <div class="text">State: {state}</div>
                <button class="button" onClick={handleButton}>Precision Mobile Testing</button>
                <div class="text">ZipCode: {zipcode}</div>
                <button class="button">689 246 5399</button>   
            </div>
			<div class="hours">Hours: {hours}</div>
        </Card>
    );
};

export default CardForm;
