import { deleteAccount } from "../../utils/userActivity";
import Button from "../Button/Button";
import toast from "react-hot-toast";
import { useState, useContext } from "react";
import UserContext from "../../Contexts/UserContext";
import { Card } from "@heroui/react";
import { AlertTriangle } from "lucide-react";

function DeleteAccount() {
  const { user, setUser } = useContext(UserContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    <Card className="card-danger">
      <div style={{ display: "flex" }}>
        <section className="settingsSection">
          <div className="header-card">
            <div className="warningIcon">
              <AlertTriangle />
            </div>
            <div className="description">
              <Card.Title className="settingsSectionTitleDanger">
                Delete Account
              </Card.Title>
              <Card.Description className="settingsCardSubDanger">
                Permanently deletes your account and all associated data. This
                cannot be undone.
              </Card.Description>
            </div>
          </div>
          <div className="buttonActions">
            <Button type="delete" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </div>
        </section>
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-danger-content">
              <h3 className="modal-title-danger">Delete Account</h3>
              <Card.Description className="modal-text-danger">
                Are you sure? This will permanently delete your account, all
                playlists, and listening history. This cannot be undone.
              </Card.Description>
              <div className="modal-actions">
                <Button
                  type="delete"
                  onClick={handleDeleteAccount}
                  loading={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  type="cancel"
                  onClick={() => setShowDeleteModal(false)}
                  loading={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default DeleteAccount;
