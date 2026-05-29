import React, { useState, useContext } from "react";
import propTypes from "prop-types";
import countryList from "react-select-country-list";
import ButtonComponent from "../../Button/Button";
import { updateUserActivity } from "../../../utils/userActivity";
import UserContext from "../../../Contexts/UserContext";
import toast from "react-hot-toast";
function Preferences({ setSettingsView }) {
  const [countryOptionSelected, setCountryOptionSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const options = countryList().getData();
  const { user, setUser } = useContext(UserContext);
  const [countryShortName, setCountryShortName] = useState(
    user?.country?.shortName || "",
  );
  const [countryFullName, setCountryFullName] = useState(
    user?.country?.fullName || "",
  );
  const country = {
    shortName: countryShortName,
    fullName: countryFullName,
  };
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
      setCountryOptionSelected(false);
      toast.success("Preferences updated successfully.");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <button className="backBtn" onClick={() => setSettingsView("main")}>
        ‹ Back
      </button>
      <h2 className="panelTitle">Preferences</h2>
      <section className="settingsSection">
        <h3
          className="settingsSectionTitle"
          onClick={() => setCountryOptionSelected((prev) => !prev)}
        >
          Change Country
        </h3>
        {countryOptionSelected && (
          <select
            value={countryShortName}
            className="settingsInput"
            onChange={(e) => {
              setCountryShortName(e.target.value);
              const selectedName =
                options.find((opt) => opt.value === e.target.value)?.label ||
                "";
              setCountryFullName(selectedName);
            }}
          >
            <option value="" disabled>
              Select Country
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <ButtonComponent onClick={handleUserPreferences} type="submit">
          {loading ? "Loading..." : "Save"}
        </ButtonComponent>
      </section>
    </div>
  );
}

Preferences.propTypes = {
  setSettingsView: propTypes.func.isRequired,
};

export default Preferences;
