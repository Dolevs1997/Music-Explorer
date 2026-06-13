import styles from "./Logo.module.css";
import { useNavigate } from "react-router";
export default function Logo() {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    // Navigate to the home page when the logo is clicked
    navigate("/home");
    window.location.reload();
  };
  return (
    <div onClick={handleLogoClick}>
      <img
        src="/music-explorer/logo-app.png"
        alt="logo"
        className={styles.logo}
      />
    </div>
  );
}
