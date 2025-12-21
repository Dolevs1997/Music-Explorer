import { APIProvider, Map, InfoWindow } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Button from "../Button/Button";
import { useNavigate } from "react-router";
import PoiMarker from "./Marker";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_MAP_ID;
function MapComponent() {
  // store clicked location
  const [selectedLocation, setSelectedLocation] = useState({ lat: 0, lng: 0 });
  // store show dialog state to add location
  const [showDialog, setShowDialog] = useState(false);
  // store dialog location
  const [dialogLocation, setDialogLocation] = useState("");
  const [locationName, setLocationName] = useState("United States");
  const [countryShortName, setCountryShortName] = useState("US");

  const navigate = useNavigate();
  async function handleMapClick(mapProps) {
    console.log("Map clicked:", mapProps);
    const lat = mapProps.detail.latLng.lat;
    const lng = mapProps.detail.latLng.lng;
    setShowDialog(true);
    setDialogLocation({ lat, lng });
    setSelectedLocation({ lat, lng });
    const result = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await result.json();
    console.log("Geocode data:", data);
    setCountryShortName(
      data.results[data.results.length - 1].address_components[0].short_name
    );
    const formattedAddress =
      data.results[data.results.length - 1].formatted_address;
    // console.log("Geocode data:", data);
    // console.log(
    //   "Formatted Address:",
    //   data.results[data.results.length - 1].formatted_address
    // );
    // console.log("Short Name:", shortName.current);
    setLocationName(formattedAddress);
  }
  async function geocode(address) {
    const result = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await result.json();

    if (data.results.length > 0) {
      const location = data.results[0].geometry.location;
      setSelectedLocation(location);
      setCountryShortName(
        data.results[data.results.length - 1].address_components[0].short_name
      );
      const formattedAddress = data.results[0].formatted_address;
      setShowDialog(true);
      setDialogLocation(location);
      setLocationName(formattedAddress);
      console.log("Location found:", location);
    } else {
      console.log("No results found");
    }
  }
  function handleLocationSelect(location) {
    // Handle location selection
    console.log("Location selected:", location);
    setSelectedLocation(location);
    navigate(`/global/categories/${countryShortName}`, {
      state: { locationName: locationName, isMapVisible: false },
    });
    setShowDialog(false);
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <div style={{ textAlign: "center" }}>
        <h1>Explore music trends around the globe!</h1>
        <p>use pins to mark your location to get personalized music</p>
      </div>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Enter location name"
          style={{
            width: "300px",
            height: "30px",
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              geocode(locationName);
            }
          }}
        />
        <Map
          mapId={MAP_ID}
          style={{ width: "100vh", height: "50vh" }}
          defaultCenter={{ lat: 22.54992, lng: 0 }}
          defaultZoom={3}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          onClick={handleMapClick}
        >
          <PoiMarker position={selectedLocation} />
        </Map>

        {showDialog && (
          <InfoWindow
            position={dialogLocation}
            onCloseClick={() => setShowDialog(false)}
          >
            <Button onClick={() => handleLocationSelect(dialogLocation)}>
              <p> Location selected: {locationName}</p>
            </Button>
          </InfoWindow>
        )}
      </APIProvider>
    </div>
  );
}

export default MapComponent;
