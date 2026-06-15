import { APIProvider, Map, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useContext } from "react";
import Button from "../Button/Button";
import { useNavigate } from "react-router";
import PoiMarker from "./Marker";
import countryList from "react-select-country-list";
import UserContext from "../../Contexts/UserContext";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_MAP_ID;
function MapComponent() {
  // store clicked location
  const [selectedLocation, setSelectedLocation] = useState({ lat: 0, lng: 0 });
  const { setCurrentLocation } = useContext(CurrentLocationContext);
  // store show dialog state to add location
  const [showDialog, setShowDialog] = useState(false);
  // store dialog location
  const [dialogLocation, setDialogLocation] = useState("");
  const [locationName, setLocationName] = useState("United States");
  const [countryShortName, setCountryShortName] = useState("US");
  const options = countryList().getData();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  async function handleMapClick(mapProps) {
    const lat = mapProps.detail.latLng.lat;
    const lng = mapProps.detail.latLng.lng;
    setShowDialog(true);
    setDialogLocation({ lat, lng });
    setSelectedLocation({ lat, lng });
    const result = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await result.json();
    setCountryShortName(
      data.results[data.results.length - 1].address_components[0].short_name,
    );
    const formattedAddress =
      data.results[data.results.length - 1].formatted_address;
    setLocationName(formattedAddress);
  }
  async function geocode(address) {
    const result = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await result.json();

    if (data.results.length > 0) {
      const location = data.results[0].geometry.location;
      setSelectedLocation(location);
      setCountryShortName(
        data.results[data.results.length - 1].address_components[0].short_name,
      );
      const formattedAddress = data.results[0].formatted_address;
      setShowDialog(true);
      setDialogLocation(location);
      setLocationName(formattedAddress);
    }
  }
  function handleLocationSelect() {
    // Handle location selection
    setCurrentLocation(locationName);
    navigate(`/global/categories/${countryShortName}`, {
      state: { isMapVisible: false },
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
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <select
            value={user?.country?.fullName}
            className="settingsInput"
            onChange={(e) => {
              const selectedName =
                options.find((opt) => opt.value === e.target.value)?.label ||
                "";
              setLocationName(selectedName);
              geocode(selectedName);
            }}
            style={{
              width: "300px",
              height: "30px",
            }}
          >
            <option>Select Country</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
            <Button onClick={handleLocationSelect} type="select">
              <p> Location selected: {locationName}</p>
            </Button>
          </InfoWindow>
        )}
      </APIProvider>
    </div>
  );
}

export default MapComponent;
