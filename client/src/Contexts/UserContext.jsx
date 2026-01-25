import { createContext, useState } from "react";
import propTypes from "prop-types";
import { getStoredUser } from "../global/StoredUser";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const updateUser = (newUser) => {
    setUser(newUser);
    console.log("newUser", newUser);
    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));
    else localStorage.removeItem("user");
  };
  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: propTypes.shape({
    formVisible: propTypes.func,
    isMapVisible: propTypes.func,
    isRecording: propTypes.func,
    isVoiceSearch: propTypes.func,
    setFormVisible: propTypes.func,
    setIsMapVisible: propTypes.func,
    setIsRecording: propTypes.func,
    setIsVoiceSearch: propTypes.func,
    setSongSuggestions: propTypes.func,
    songSuggestions: propTypes.array,
  }),
};

export default UserContext;
