import { Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase.js";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function Layout() {
  const [user] = useAuthState(auth);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <nav style={{
        padding: "1rem 2rem",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: "1.5rem", 
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            ✓ FakeCheck
          </h2>
          
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: "none",
                color: location.pathname === "/" ? "#667eea" : "#4a5568",
                fontWeight: location.pathname === "/" ? "600" : "normal",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background: location.pathname === "/" ? "#f7fafc" : "transparent",
                transition: "all 0.3s ease"
              }}
            >
              Home
            </Link>
            {user && (
              <Link 
                to="/history" 
                style={{ 
                  textDecoration: "none",
                  color: location.pathname === "/history" ? "#667eea" : "#4a5568",
                  fontWeight: location.pathname === "/history" ? "600" : "normal",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  background: location.pathname === "/history" ? "#f7fafc" : "transparent",
                  transition: "all 0.3s ease"
                }}
              >
                History
              </Link>
            )}
          </div>
        </div>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img 
                src={user.photoURL || "https://via.placeholder.com/32"} 
                alt="Profile" 
                style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%",
                border: "2px solid #667eea"
            }} 
            />
            <span style={{ fontSize: "0.9rem", color: "#4a5568" }}>
              {user.displayName}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                background: "#fff",
                color: "#e53e3e",
                border: "1px solid #e53e3e",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e53e3e";
                e.currentTarget.style.color = "#fff";
                }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#e53e3e";
                }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}