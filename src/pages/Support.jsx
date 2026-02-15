import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/support.css";

function Support() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "supportRequests"), {
        uid: user.uid,
        email: user.email,
        subject,
        message,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSuccess("Inquiry sent successfully. Our team will respond shortly.");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="support">

      <header className="topbar">
        <button onClick={() => navigate("/profile")}>← Back</button>
        <h2>Support Center</h2>
      </header>

      <div className="support-container">

        {/* Contact Card */}
        <div className="support-card info">
          <h3>Contact Support</h3>
          <p>
            Need help? Our team is here to assist you 24/7.
          </p>

          <div className="contact-box">
            <span>Email:</span>
            <strong>sstuhustle@gmail.com</strong>
          </div>

          <div className="contact-box">
            <span>Response Time:</span>
            <strong>Within 24 Hours</strong>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="support-card form">

          <h3>Send an Inquiry</h3>

          {success && <p className="success">{success}</p>}

          <label>Subject</label>
          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label>Message</label>
          <textarea
            rows="5"
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Submit Inquiry"}
          </button>

        </div>

      </div>

      <footer className="profile-footer">
        © 2026 StuHustle · Powered by PECO Industries
      </footer>

    </div>
  );
}

export default Support;
