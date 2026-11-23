import { APIProvider, Map, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useContext } from "react";
import Button from "../Button/Button";
import { useNavigate } from "react-router";
import PoiMarker from "./Marker";
import countryList from "react-select-country-list";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";
import { NavDropdown } from "react-bootstrap";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_MAP_ID;

function MapContent() {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 22.54992,
    lng: 0,
  });
  const { setCurrentLocation } = useContext(CurrentLocationContext);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLocation, setDialogLocation] = useState({
    lat: 22.54992,
    lng: 0,
  });
  const [locationName, setLocationName] = useState("United States");
  const [countryShortName, setCountryShortName] = useState("US");
  const options = countryList().getData();
  const navigate = useNavigate();

  function handleMapClick(mapProps) {
    if (!mapProps.detail || !mapProps.detail.latLng) return;

    const lat = mapProps.detail.latLng.lat;
    const lng = mapProps.detail.latLng.lng;
    const clickedCoord = { lat, lng };

    setSelectedLocation(clickedCoord);
    setDialogLocation(clickedCoord);

    // Safety check: Ensure the base Google Maps API is loaded
    if (!window.google || !window.google.maps) return;

    // Call the Geocoder directly from the global object
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: clickedCoord }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const countryResult = results[results.length - 1];
        const shortName =
          countryResult.address_components[0]?.short_name || "US";
        const formattedAddress = countryResult?.formatted_address;

        setCountryShortName(shortName);
        setLocationName(formattedAddress);
        setShowDialog(true);
      }
    });
  }

  function geocodeAddress(address) {
    if (!address || !window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };

        const countryResult = results[results.length - 1];
        const shortName =
          countryResult.address_components[0]?.short_name || "US";
        const formattedAddress = results[0].formatted_address;
        setSelectedLocation(location);
        setDialogLocation(location);
        setCountryShortName(shortName);
        setLocationName(formattedAddress);
        setShowDialog(true);
      }
    });
  }

  function handleLocationSelect() {
    setCurrentLocation(locationName);
    navigate(`/global/categories/${countryShortName}`, {
      state: { isMapVisible: false },
    });
    setShowDialog(false);
  }
  const selectedCountry = options.find(
    (option) => option.value === countryShortName,
  )?.label;
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <NavDropdown
          title={selectedCountry || "Choose a country from the list"}
          className="settingsInput"
          onSelect={(countryCode) => {
            const selectedCountry = options.find(
              (opt) => opt.value === countryCode,
            );
            console.log(selectedCountry);
            if (selectedCountry) {
              setCountryShortName(selectedCountry.value);
              geocodeAddress(selectedCountry.label);
            }
            // setCountryShortName(selectedVal);
            // geocodeAddress(selectedLabel);
          }}
          style={{ width: "300px", height: "30px" }}
        >
          {options.map((option) => (
            <NavDropdown.Item key={option.value} eventKey={option.value}>
              {option.label}
            </NavDropdown.Item>
          ))}
        </NavDropdown>
      </div>

      <Map
        mapId={MAP_ID}
        style={{ width: "100%", height: "50vh" }}
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
          {/* Note: Ensure your Button component has been updated to accept 'variant' as we discussed previously, otherwise this might render as a standard gray button */}
          <Button onClick={handleLocationSelect} type="select">
            <p>Location selected: {locationName}</p>
          </Button>
        </InfoWindow>
      )}
    </>
  );
}

export default function MapComponent() {
  return (
    <div style={{ marginTop: "30px" }}>
      <div style={{ textAlign: "center" }}>
        <h1 className="title-application">
          Explore music trends around the globe!
        </h1>
        <span className="subtitle">
          Use pins to mark your location to get personalized music
        </span>
      </div>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <MapContent />
      </APIProvider>
    </div>
  );
}
