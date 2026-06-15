import styles from "./Logo.module.css";
import { useNavigate } from "react-router";
import propTypes from "prop-types";
import { useContext } from "react";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";

export default function Logo() {
  const navigate = useNavigate();
  const { currentLocation } = useContext(CurrentLocationContext);
  const handleLogoClick = () => {
    // Navigate to the home page when the logo is clicked
    navigate("/home");
    window.location.reload();
  };
  return (
    <div className={styles.logoContainer}>
      <div onClick={handleLogoClick}>
        <img
          src="/music-explorer/logo-app.png"
          alt="logo"
          className={styles.logo}
        />
      </div>
      <span className="languageSelector" style={{ marginLeft: "80px" }}>
        Country: {currentLocation}
      </span>
    </div>
  );
}

Logo.propTypes = {
  currentCountry: propTypes.string,
};
