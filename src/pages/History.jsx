import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function History() {
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!user) return;
      const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "checks"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        setHistory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const getVerdictColor = (label) => {
    const labelStr = String(label || "").toLowerCase();
    if (labelStr.includes("true")) return "#10b981";
    if (labelStr.includes("false")) return "#ef4444";
    return "#f59e0b";
  };

  const getVerdictIcon = (label) => {
    const labelStr = String(label || "").toLowerCase();
    if (labelStr.includes("true")) return "✓";
    if (labelStr.includes("false")) return "✗";
    return "?";
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 73px)",
      padding: "3rem 1rem"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "3rem"
        }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "0.5rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            Verification History
          </h1>
          <p style={{
            fontSize: "1.125rem",
            color: "rgba(255, 255, 255, 0.9)"
          }}>
            Your past fact-checks and analysis
          </p>
        </div>

        {loading ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              margin: "0 auto 1rem",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{ color: "#718096" }}>Loading your history...</p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : history.length === 0 ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
            <h2 style={{
              fontSize: "1.5rem",
              color: "#2d3748",
              marginBottom: "0.5rem"
            }}>
              No Checks Yet
            </h2>
            <p style={{ color: "#718096", marginBottom: "1.5rem" }}>
              Start verifying news and your history will appear here
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontWeight: "600",
                transition: "transform 0.3s ease"
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
              Start Fact-Checking
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  border: "1px solid #e2e8f0"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1rem"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: getVerdictColor(item.label),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    flexShrink: 0
                  }}>
                    {getVerdictIcon(item.label)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.5rem"
                    }}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        background: `${getVerdictColor(item.label)}20`,
                        color: getVerdictColor(item.label),
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: "600"
                      }}>
                        {typeof item.label === 'string' ? item.label : 'Analyzed'}
                      </span>
                      <span style={{
                        fontSize: "0.875rem",
                        color: "#a0aec0"
                      }}>
                        {item.timestamp?.toDate().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <p style={{
                      margin: 0,
                      color: "#2d3748",
                      fontSize: "1rem",
                      lineHeight: "1.6"
                    }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}