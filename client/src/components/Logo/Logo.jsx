import styles from "./Logo.module.css";
import { useNavigate } from "react-router";
import propTypes from "prop-types";

export default function Logo() {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    // Navigate to the home page when the logo is clicked
    navigate("/home");
    window.location.reload();
  };
  return (
    <button
      type="button"
      className={styles.logoButton}
      onClick={handleLogoClick}
      aria-label="Go to home"
    >
      <img
        src="/logo-app.png"
        alt="Music Explorer Home"
        className={styles.logo}
      />
    </button>
  );
}

Logo.propTypes = {
  currentCountry: propTypes.string,
};
