import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1rem"
    }}>
      <div style={{
        background: "white",
        padding: "3rem 2rem",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center"
      }}>
        <div style={{
          fontSize: "4rem",
          marginBottom: "1rem"
        }}>
          ✓
        </div>
        
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          FakeCheck
        </h1>
        
        <p style={{
          color: "#718096",
          marginBottom: "2rem",
          fontSize: "1rem"
        }}>
          Verify news credibility with AI-powered fact-checking
        </p>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "0.875rem",
            background: "white",
            color: "#4a5568",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
            <path d="M13.46 15.13c-.12.08-.26.15-.38.22l3.16 2.45c1.52-1.4 2.45-3.5 2.45-5.99 0-.58-.05-1.13-.14-1.67H10v3.72h5.5c-.27 1.08-1.02 1.97-1.96 2.55l-.08.72z" fill="#34A853"/>
            <path d="M3.99 10c0-.69.12-1.35.32-1.97L1.11 5.09C.39 6.4 0 7.95 0 10s.39 3.6 1.11 4.91l3.2-2.94c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05"/>
            <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.46.99 12.43 0 10 0 6.48 0 3.44 2.02 1.11 5.09l3.2 2.94C5.07 5.69 7.31 3.88 10 3.88z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{
          marginTop: "1.5rem",
          fontSize: "0.875rem",
          color: "#a0aec0"
        }}>
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  );
}