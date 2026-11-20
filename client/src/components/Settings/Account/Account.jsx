import styles from "./Account.module.css";
import { useState, useContext } from "react";
import { changeUserPassword } from "../../../utils/userActivity";
import UserContext from "../../../Contexts/UserContext";
import toast from "react-hot-toast";
import propTypes from "prop-types";
import EyeIconPassword from "../../EyeIconPassword/EyeIconPassword";
import Button from "../../Button/Button";
import { Card } from "@heroui/react";
import { UserRound } from "lucide-react";

function Account() {
  const { user } = useContext(UserContext);

  //Password states

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }
    setPwLoading(true);
    try {
      const data = await changeUserPassword(user, currentPassword, newPassword);
      toast.success(data.message);
    } catch (error) {
      console.error("Error changing user password:", error);
      toast.error(error.message);
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPwLoading(false);
  }

  return (
    <Card className="card">
      <div className="header-card">
        <div className="icon-card">
          <UserRound />
        </div>
        <div className="description">
          <Card.Title className="settingsSectionTitle">Account</Card.Title>
          <Card.Description className="settingsCardSub">
            Change your Password
          </Card.Description>
        </div>
      </div>

      {/* Change Password */}
      <section className="settingsSection">
        <div className={styles.settingsForm}>
          <div className="passwordInputContainer">
            <input
              className="settingsInput"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <EyeIconPassword
              size={20}
              showPassword={showCurrentPassword}
              setShowPassword={setShowCurrentPassword}
            />
          </div>
          <div className="passwordInputContainer">
            <input
              className="settingsInput"
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <EyeIconPassword
              size={20}
              showPassword={showNewPassword}
              setShowPassword={setShowNewPassword}
            />
          </div>
          <div className="passwordInputContainer">
            <input
              className="settingsInput"
              type={showConfirmNewPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <EyeIconPassword
              size={20}
              showPassword={showConfirmNewPassword}
              setShowPassword={setShowConfirmNewPassword}
            />
          </div>
        </div>
        <div className="buttonActions">
          <Button
            type="submit"
            onClick={handleChangePassword}
            loading={pwLoading}
          >
            {pwLoading ? "Saving..." : "Change Password"}
          </Button>
        </div>
      </section>
      {/* Delete Account */}
    </Card>
  );
}
Account.propTypes = {
  setSettingsView: propTypes.func,
};
export default Account;
