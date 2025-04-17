import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useUserLocations } from "./hooks/useUsersLocations.ts";

const containerStyle = {
	width: "100%",
	height: "500px",
	borderRadius: "10px",
	boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
};

const center = {
	lat: 48.8566,
	lng: 2.3522,
};

const customMapStyle = [
	{ elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
	{ featureType: "water", stylers: [{ color: "#2c2c2c" }] },
	{ featureType: "road", stylers: [{ color: "#383838" }] },
	{ featureType: "poi", stylers: [{ visibility: "off" }] },
	{ featureType: "transit", stylers: [{ color: "#242424" }] },
];

const createMarkerIcon = (color: string) => {
	return {
	  path: "M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0",
	  fillColor: color,
	  fillOpacity: 1,
	  scale: 1,
	};
 };

export const Nearby = () => {
    const { locations, loading, error } = useUserLocations();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>No users find at this time</p>;
	return (
		<div className="mt-10 mx-6">
			<LoadScript
				googleMapsApiKey={`${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
			>
		      <GoogleMap
		        mapContainerStyle={containerStyle}
		        center={center}
		        zoom={13}
		        options={{ styles: customMapStyle, disableDefaultUI: true }}
		      >
		        {locations.map((location) => (
		          <Marker
		            key={location.username}
		            position={{ lat: location.lat, lng: location.lng }}
		            label={{
		              text: location.username,
		              color: "#ffffff",
		              fontSize: "12px",
		              fontWeight: "bold",
		            }}
					icon={createMarkerIcon(location.isCurrentUser ? "#FFFFFF" : "#FF69B4")}
				  />
		        ))}
		      </GoogleMap>
			</LoadScript>
		</div>
	);
};
