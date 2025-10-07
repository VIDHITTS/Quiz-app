import { useState, useEffect } from "react";
import config from "../config";
import "./Profile.css";

const API_BASE = config.API_BASE;

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
        });
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setSuccess("Profile updated successfully!");
        setEditing(false);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
    });
    setEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h2>{profile.name}</h2>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-group">
                <label>Full Name</label>
                <p>{profile.name}</p>
              </div>

              <div className="info-group">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>

              <div className="info-group">
                <label>Member Since</label>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>

              {profile.stats && (
                <>
                  <div className="info-group">
                    <label>Quizzes Created</label>
                    <p>{profile.stats.quizzesCreated}</p>
                  </div>

                  <div className="info-group">
                    <label>Quizzes Taken</label>
                    <p>{profile.stats.quizzesTaken}</p>
                  </div>
                </>
              )}

              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
