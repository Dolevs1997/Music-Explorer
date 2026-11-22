import React, { useState, useContext, useEffect } from "react";
import propTypes from "prop-types";
import countryList from "react-select-country-list";
import ButtonComponent from "../../Button/Button";
import { updateUserActivity } from "../../../utils/userActivity";
import UserContext from "../../../Contexts/UserContext";
import toast from "react-hot-toast";
import { CurrentLocationContext } from "../../../Contexts/CurrentLocationContext";
import { Card } from "@heroui/react";
import { Globe } from "lucide-react";
import { NavDropdown } from "react-bootstrap";
function Preferences() {
  const [loading, setLoading] = useState(false);
  const options = countryList().getData();
  const { user, setUser } = useContext(UserContext);
  const [countryShortName, setCountryShortName] = useState(
    user?.country?.shortName || "",
  );
  const [countryFullName, setCountryFullName] = useState(
    user?.country?.fullName || "",
  );
  const { setCurrentLocation } = useContext(CurrentLocationContext);
  const country = {
    shortName: countryShortName,
    fullName: countryFullName,
  };
  const selectedCountryLabel = options.find(
    (option) => option.value === countryShortName,
  )?.label;
  console.log(selectedCountryLabel);
  async function handleUserPreferences() {
    if (
      !countryShortName ||
      countryShortName === user.country?.shortName ||
      !countryFullName ||
      countryFullName === user.country?.fullName
    ) {
      toast.error("Please select a country");
      return;
    }
    setLoading(true);
    try {
      await updateUserActivity(user, { country });
      setUser({ ...user, country });
      setCurrentLocation(countryFullName);
      toast.success("Preferences updated successfully.");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // UI will automatically re-render when currentLocation changes
    // Components consuming currentLocation context will update
  }, []);
  return (
    <Card className="card">
      <div style={{ display: "flex" }}>
        <div className="header-card">
          <div className="icon-card">
            <Globe />
          </div>
          <div className="description">
            <Card.Title className="settingsSectionTitle">
              Preferences
            </Card.Title>
            <Card.Description className="settingsCardSub">
              Default region for song recommendations
            </Card.Description>
          </div>
        </div>
        <section className="settingsSection">
          <NavDropdown
            className="settingsInput"
            title={selectedCountryLabel || "Select Country"}
            onSelect={(countryCode) => {
              const selectedCountry = options.find(
                (option) => option.value === countryCode,
              );
              if (selectedCountry) {
                setCountryShortName(selectedCountry.value);
                setCountryFullName(selectedCountry.label);
              }
            }}
          >
            {options.map((option) => (
              <NavDropdown.Item key={option.value} eventKey={option.value}>
                {option.label}
              </NavDropdown.Item>
            ))}
          </NavDropdown>
          <div className="buttonActions">
            <ButtonComponent onClick={handleUserPreferences} type="submit">
              {loading ? "Loading..." : "Save"}
            </ButtonComponent>
          </div>
        </section>
      </div>
    </Card>
  );
}

Preferences.propTypes = {
  setSettingsView: propTypes.func.isRequired,
};

export default Preferences;
