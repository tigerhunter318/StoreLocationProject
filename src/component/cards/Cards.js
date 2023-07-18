import React, { useState, useEffect } from 'react';
import './styles.css'
import { useSelector } from 'react-redux';
import jsondata from '../data.json'
import CardForm from './cardform/CardForm'
import { searchCenterLocation, getSearchResults } from '../../app/api'; // import your async functions

const Cards = () => {
	const locations = jsondata.map(data => { return data; });
	const zipcode = useSelector((state) => state.zipcode);
	const radius = useSelector((state) => state.radius);
	const cardsPerPage = 50; // Number of cards to display per page
	const [searchResults, setSearchResults] = useState([]); // state to hold search results
	const [currentPage, setCurrentPage] = useState(1); // state to hold current page number
	const rightlat = useSelector((state) => state.rightlat) || 0;
	const rightlng = useSelector((state) => state.rightlng) || 0;


	useEffect(() => {
		const fetchSearchResults = async () => {
			try {
				if (zipcode != null) {
					const centerLocation = await searchCenterLocation(zipcode);
					const results = await getSearchResults(centerLocation, locations, radius);
					setSearchResults(results);
				}
			} catch (error) {
				console.error(error);
			}
		};
		fetchSearchResults();
	}, [radius, zipcode]);

	useEffect(() => {
		let index = searchResults.findIndex(location => location[5] === rightlng && location[6] === rightlat);
		console.log(index, parseInt(index / cardsPerPage), index % cardsPerPage);
		paginate(parseInt(index / cardsPerPage) + 1);
		index = index % cardsPerPage;
		if (rightlat !== 0 && rightlng !== 0) {
			window.scrollTo({
				top: index * 270,
				behavior: 'smooth',
			});
		}
	}, [rightlat, rightlng]);
	// Calculate the index range of cards to display on the current page
	const indexOfLastCard = currentPage * cardsPerPage;
	const indexOfFirstCard = indexOfLastCard - cardsPerPage;
	const currentCards = searchResults.slice(indexOfFirstCard, indexOfLastCard);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	return (
		<div>
			{searchResults[0] !== undefined ? (
				currentCards.map((result, index) => {
					let distance = result[8].toFixed(2);
					distance = distance === 0 ? 0 : distance;
					let id = 'normal';
					let attribute = 0;
					console.log("rightlat, RightLng", rightlat, rightlng);
					if (rightlat !== 0 && rightlng !== 0) {
						if (result[5] === rightlng && result[6] === rightlat) {
							attribute = 1;
						}
					}
					return (
						<CardForm
							key={index}
							className={id}
							address={result[0]}
							city={result[1]}
							state={result[2]}
							zipcode={result[3]}
							lng={result[5]}
							lat={result[6]}
							attribute={attribute}
							distance={distance}
							hours={result[7]}
						/>
					);
				})
			) : ''}

			{/* Pagination */}
			<div className="pagination">
				{searchResults.length > cardsPerPage &&
					Array.from({ length: Math.ceil(searchResults.length / cardsPerPage) }, (_, i) => i + 1).map((pageNumber) => (
						<button key={pageNumber} onClick={() => paginate(pageNumber)} className={`pagination_button ${currentPage === pageNumber ? 'current_pagination_button' : ''}`}>
							{pageNumber}
						</button>
					))}
			</div>
		</div>
	);

};

export default Cards;
