import { useNavigate } from "react-router-dom";
import "../styles/splash.css";

function Splash() {
  const navigate = useNavigate();

  return (
    <div className="splash-container">
      <h1 className="logo">StuHustle</h1>
      <p className="tagline">Your hustle starts here</p>

      <div className="button-group">
        <button className="primary-btn" onClick={() => navigate("/signup")}>
          Get Started
        </button>

        <button className="secondary-btn" onClick={() => navigate("/login")}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default Splash;
