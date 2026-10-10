import { useContext } from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { useNavigate } from "react-router";
import { Globe } from "lucide-react";

function Global() {
  const { setIsMapVisible, isMapVisible } = useContext(SearchContext);
  const navigate = useNavigate();
  const handleMapClick = () => {
    setIsMapVisible(!isMapVisible);
    navigate("/global");
  };
  return (
    <button onClick={handleMapClick}>
      <div className="search-tool">
        <Globe
          size={28}
          strokeWidth={1.5}
          style={{
            cursor: "pointer",
            color: "#A855F7",
            filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))",
          }}
        />
        Pick on Map
      </div>
    </button>
  );
}

export default Global;
