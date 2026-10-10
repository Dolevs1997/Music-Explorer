import styles from "./Logo.module.css";
import { useNavigate } from "react-router";
import { AudioLines } from "lucide-react";

export default function Logo() {
  const navigate = useNavigate();
  const handleLogoClick = () => {
    // Navigate to the home page when the logo is clicked
    navigate("/home");
    window.location.reload();
  };
  return (
    <div className={styles.logo} onClick={handleLogoClick}>
      <AudioLines
        size={28}
        strokeWidth={1.5}
        style={{
          cursor: "pointer",
          color: "#A855F7",
          filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))",
        }}
      />
      <h6>Music Explorer</h6>
    </div>
  );
}
