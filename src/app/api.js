import axios from 'axios';
import settings from '../settings';
import jsondata from '../component/data.json'

const locations = jsondata.map(data => { return data; });

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

export const searchCenterLocation = async (zipcode) => {
	if (zipcode == null) return locations[0];
	const accessToken = settings.MapBox_accessToken; // replace with your Mapbox access token
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipcode}.json?country=US&types=postcode&access_token=${accessToken}`;

	try {
		const response = await axios.get(url);
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
			return result;
		} else {
			alert("No results found");
			return locations[0];
		}
	} catch (error) {
		throw new Error(error.message);
	}
};

export const getSearchResults = async (centerLocation, locations, radius) => {
	let searchResults = [];

	if (radius == null) searchResults.push(centerLocation);
	else {
		locations.forEach(location => {
			let distance = getDistanceFromLatLonInMiles(centerLocation['Latitude'], centerLocation['Longitude'], location['Latitude'], location['Longitude']);
			if (distance < radius) {
				searchResults.push([location['address'], location['city'], location['state'], location['zipcode'], location['Full_Address'], location['Longitude'], location['Latitude'], location['hours'], distance]);
			}
		});
	}

	return searchResults;
};
