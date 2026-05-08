import { useState, useContext } from "react";
import { changeUserPassword, deleteAccount } from "../../../utils/userActivity";
import UserContext from "../../../Contexts/UserContext";
import toast from "react-hot-toast";
import styles from "./AccountEdit.module.css";
import propTypes from "prop-types";
import ButtonComponent from "../../Button/Button"
import EyeIconPassword from "../../EyeIconPassword/EyeIconPassword"
function AccountEdit({ setSettingsView }) {
  const { user, setUser } = useContext(UserContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  //Password states

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  // async function handleUpdateDisplayName(e) {
  //   e.preventDefault();
  //   if (!displayName.trim()) {
  //     toast.error("Display name cannot be empty.");
  //     return;
  //   }
  //   try {
  //     await updateUserActivity(user, { displayName: displayName.trim() });
  //     setUser({ ...user, displayName: displayName.trim() });
  //     toast.success("Display name updated!");
  //   } catch {
  //     toast.error("Failed to update display name.");
  //   }
  // }
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
    if(currentPassword === newPassword){
      toast.error("New password must be different from current password.");
      return;
    }
    setPwLoading(true);
    try{
      const data = await changeUserPassword(user, currentPassword, newPassword);
      console.log("data: ", data);
      toast.success(data.message);
    }catch(error){
      console.error("Error changing user password:", error);
      toast.error(error.message);
    }
    setSelectedPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPwLoading(false);
  }
  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      await deleteAccount(user);

      setUser(null);
      toast.success("Account deleted.");
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  }
  return (
    <div>
      <button className="backBtn" onClick={() => setSettingsView("main")}>
        ‹ Back
      </button>
      <h2 className="panelTitle">Account</h2>
      {/* Display Name
      <section className="settingsSection">
        <h3
          className="settingsSectionTitle"
          onClick={() => setSelectedDisplayName((prev) => !prev)}
        >
          Display Name
        </h3>
        {selectedDisplayName && !selectedPassword && !showDeleteModal && (
          <form onSubmit={handleUpdateDisplayName} className="settingsForm">
            <input
              className="settingsInput"
              type="text"
              placeholder="Enter display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <button className="settingsBtn" type="submit">
              Update Name
            </button>
          </form>
        )}
      </section> */}
      {/* Change Password */}
      <section className="settingsSection">
        <h3
          className="settingsSectionTitle"
          onClick={() => setSelectedPassword((prev) => !prev)}
        >
          Change Password
        </h3>
        {selectedPassword && !showDeleteModal && (
          <form className="settingsForm">
            <div className="passwordInputContainer">
            <input
              className="settingsInput"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              />
              <EyeIconPassword size={20} showPassword={showCurrentPassword} setShowPassword={setShowCurrentPassword}/>
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
              <EyeIconPassword size={20} showPassword={showNewPassword} setShowPassword={setShowNewPassword}/>
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
              <EyeIconPassword size={20} showPassword={showConfirmNewPassword} setShowPassword={setShowConfirmNewPassword}/>
              </div>
            <button className="settingsBtn" type="button" disabled={pwLoading} onClick={handleChangePassword}>
              {pwLoading ? "Saving..." : "Change Password"}
            </button>
            <ButtonComponent type="cancel" onClick={() => {
              setSelectedPassword(false)
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
              }}>
              Cancel
            </ButtonComponent>
          </form>
        )}
      </section>
      {/* Delete Account */}
      <section className="settingsSection">
        <p className="settingsSectionNote">
          Permanently deletes your account and all associated data. This cannot
          be undone.
        </p>
        <button
          className={styles.settingsBtnDanger}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </section>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && !selectedPassword && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Account</h3>
            <p className={styles.modalText}>
              Are you sure? This will permanently delete your account, all
              playlists, and listening history. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className="settingsBtn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className={styles.settingsBtnDanger}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
AccountEdit.propTypes = {
  setSettingsView: propTypes.func,
};
export default AccountEdit;
