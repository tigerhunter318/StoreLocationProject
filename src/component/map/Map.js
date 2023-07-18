import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import jsondata from '../data.json'
import './styles.css'
import { useSelector } from 'react-redux';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import settings from '../../settings';
import { useDispatch } from 'react-redux';

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

<><script src='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'></script><link href='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css' rel='stylesheet' /></>

const Map = () => {
	const locations = jsondata.map(data => { return data; });
	const zipcode = useSelector((state) => state.zipcode);
	const radius = useSelector((state) => state.radius) || 0;
	const leftlat = useSelector((state) => state.leftlat) || 0;
	const leftlng = useSelector((state) => state.leftlng) || 0;
	const [rightlat, setRightLat] = React.useState('');
	const [rightlng, setRightLng] = React.useState('');
	const dispatch = useDispatch();

	let searchResults = [];

	useEffect(() => {
		console.log("a, b", rightlat, rightlng);
		dispatch({ type: 'RightClick', payload: { rightlat, rightlng } });
	  }, [rightlat, rightlng]);

	function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2 - lat1); // deg2rad below
		var dLon = deg2rad(lon2 - lon1);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c / 1.825; // convert km to miles
		return d;
	}

	function deg2rad(deg) {
		return deg * (Math.PI / 180);
	}

	let centerLocation = {};
	const searchCenterLocation = async () => {
		const accessToken = settings.MapBox_accessToken; // replace with your Mapbox access token
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipcode}.json?country=US&types=postcode&access_token=${accessToken}`;

		return new Promise((resolve, reject) => {
			axios
				.get(url)
				.then(response => {
					const features = response.data.features;
					if (features.length > 0) {
						const result = {
							address: features[0].place_name,
							city: features[0].context[1].text,
							state: features[0].context[0].text,
							zipcode: features[0].text,
							Full_Address: features[0].place_name,
							Longitude: features[0].center[0],
							Latitude: features[0].center[1],
							hours: '',
						};
						centerLocation = result;
						resolve(result);
					} else {
						reject(new Error('No results found'));
					}
				})
				.catch(error => {
					reject(new Error(error.message));
				});
		});
	}

	//	let centerLocation = zipcode != null ? searchCenterLocation() : locations[0];
	const getSearchResults = async () => {
		if (zipcode != null) {
			try {
				await searchCenterLocation();
				if (radius == null) searchResults.push(centerLocation);
				locations.forEach(location => {
					let distance = getDistanceFromLatLonInMiles(centerLocation['Latitude'], centerLocation['Longitude'], location['Latitude'], location['Longitude']);
					if (distance < radius) {
						searchResults.push([location['address'], location['city'], location['state'], location['zipcode'], location['Full_Address'], location['Longitude'], location['Latitude'], location['hours'], distance]);
					}
				});
			} catch (error) {
				console.error(error);
			}
		}
		else {
			centerLocation = locations[0];
			locations.map((location, index) => {
				searchResults.push([location['address'], location['city'], location['state'], location['zipcode'], location['Full_Address'], location['Longitude'], location['Latitude'], location['hours'], 0]);
			});
		}
	};

	const initializeMap = async () => {
		await getSearchResults();
		const center = searchResults[0] !== undefined ? [searchResults[0][5], searchResults[0][6]] : [locations[0]['Longitude'], locations[0]['Latitude']];

		mapboxgl.accessToken = 'pk.eyJ1IjoiY2FkZW4weCIsImEiOiJjbGp1eGNrMXIwcmVjM2pqdWF2am16dG1kIn0.dXLpfTtvRpvEU6lQ3Uj79w';

		const map = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: 'mapbox://styles/examples/clg45vm7400c501pfubolb0xz',
			center: center,
			zoom: 10.7,
		});

		const markers = searchResults.map((location, index) => {
			const marker = new mapboxgl.Marker();

			// Set the size and color of the first marker
			if (index === 0) {
				marker.setLngLat([location[5], location[6]])
					.addTo(map)
			} else {
				if (searchResults.length < 1000) {
					marker.setLngLat([location[5], location[6]])
						.addTo(map)
				}
				else {
					marker.setLngLat([location[5], location[6]])
				}
			}

			// Add a label containing the address when hovering over the marker
			const popup = new mapboxgl.Popup({ offset: 25 });
			marker.setPopup(popup);

			marker.getElement().addEventListener('mouseenter', () => {
				popup.setHTML(`<p>${location[0]}</p>`);
				popup.addTo(map);
			});

			marker.getElement().addEventListener('mouseleave', () => {
				popup.remove();
			});

			marker.getElement().addEventListener('click', () => {
				console.log(marker.getLngLat().lat, marker.getLngLat().lng);
				setRightLat( marker.getLngLat().lat);
				setRightLng( marker.getLngLat().lng );
			});

			return marker;
		});
		

		console.log(leftlat, leftlng);
		map.on('load', () => {
			map.addSource('markers', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: markers.map(marker => {
						return {
							type: 'Feature',
							geometry: {
								type: 'Point',
								coordinates: [marker.getLngLat().lng, marker.getLngLat().lat]
							}
						};
					})
				},
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 50
			});

			map.addLayer({
				id: 'clusters',
				type: 'circle',
				source: 'markers',
				filter: ['has', 'point_count'],
				paint: {
					'circle-color': [
						'step',
						['get', 'point_count'],
						'#51bbd6',
						100,
						'#f1f075',
						750,
						'#f28cb1'
					],
					'circle-radius': [
						'step',
						['get', 'point_count'],
						20,
						100,
						30,
						750,
						40
					]
				}
			});

			map.addLayer({
				id: 'cluster-count',
				type: 'symbol',
				source: 'markers',
				filter: ['has', 'point_count'],
				layout: {
					'text-field': '{point_count_abbreviated}',
					'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
					'text-size': 12
				}
			});

			map.addLayer({
				id: 'unclustered-points',
				type: 'circle',
				source: 'markers',
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-color': '#11b4da',
					'circle-radius': 4,
					'circle-stroke-width': 1,
					'circle-stroke-color': '#fff'
				}
			});


			if (searchResults[0] !== undefined) {
				map.on('zoomend', () => {
					const currentZoom = map.getZoom();
					const threshold = 10;

					if (currentZoom > threshold) {
						markers.forEach(marker => marker.addTo(map));
					} else {
						markers.forEach(marker => marker.remove());
					}
					if (currentZoom <= threshold) {
						map.setLayoutProperty('clusters', 'visibility', 'visible');
						map.setLayoutProperty('unclustered-point', 'visibility', 'none');
					} else {
						map.setLayoutProperty('clusters', 'visibility', 'none');
						map.setLayoutProperty('unclustered-point', 'visibility', 'visible');
					}
				});
				if (leftlat === 0 && leftlng === 0) {
					const bounds = new mapboxgl.LngLatBounds();
					markers.forEach(marker => {
						const lngLat = marker.getLngLat();
						if (lngLat) {
							bounds.extend(lngLat);
						}
					});

					map.fitBounds(bounds, { padding: 50 });
				}
				else {
					map.setCenter([leftlng, leftlat]);
					const index = searchResults.findIndex(location => location[5] === leftlng && location[6] === leftlat);
					if(index !== -1) markers[index].getElement().classList.add("custom-marker");
				}
			}
		});

		return map;
	};
	const mapContainerRef = useRef(null);
	useEffect(() => {
		initializeMap().then(map => {
			return () => map.remove();
		});
	}, [radius, zipcode, leftlat, leftlng]);

	return (
		<div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
	);

};

export default Map;
