import { useState } from "react";
import axios from "axios";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  // ✅ Voting-related state
  const [checkId, setCheckId] = useState(null);
  const [voted, setVoted] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");

  const handleCheck = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setScore(null);
    setCheckId(null);
    setVoted(false);

    try {
      const res = await axios.post("/api/proxy", { text });
      console.log("🔍 API Response:", res.data);

      // ✅ Normalize the output
      const output =
        typeof res.data === "string"
          ? res.data
          : typeof res.data.result === "string"
          ? res.data.result
          : JSON.stringify(res.data, null, 2);

      setResult(output);

      // ✅ Estimate confidence score
      const lower = output.toLowerCase();
      let conf = 50;
      if (lower.includes("highly true") || lower.includes("strongly true"))
        conf = 95;
      else if (lower.includes("likely true")) conf = 85;
      else if (lower.includes("true")) conf = 75;
      else if (lower.includes("uncertain")) conf = 50;
      else if (lower.includes("likely false")) conf = 60;
      else if (lower.includes("false")) conf = 80;
      setScore(conf);

      // ✅ Firestore save + store ID for voting
      const checkRef = await addDoc(collection(db, "checks"), {
        userId: user?.uid || "anonymous",
        text,
        label: output.substring(0, 500),
        confidence: conf,
        timestamp: serverTimestamp(),
      });
      setCheckId(checkRef.id);

      console.log("✅ Saved to Firestore successfully!");
    } catch (error) {
      console.error("❌ Error analyzing:", error);
      setResult("Error: Unable to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  console.log("Voting path:", `checks/${checkId}/votes/${user?.uid}`);
  console.log("Auth UID:", user?.uid);

  // ✅ Handle vote (Accurate / Inaccurate)
  const handleVote = async (voteValue) => {
  if (!checkId || !user) {
    alert("Please log in to vote.");
    return;
  }

  try {
    // Use the user's UID as the doc id (so one vote per user per check)
    const voteRef = doc(collection(db, "checks", checkId, "votes"), user.uid);

    await setDoc(voteRef, {
      voterId: user.uid,           // <-- include voterId in the document
      vote: voteValue,             // 1 or -1
      comment: null,
      timestamp: serverTimestamp(),
    });

    setVoted(true);
    alert(voteValue === 1 ? "👍 Thanks for confirming!" : "👎 Thanks for your feedback!");
  } catch (err) {
    console.error("Vote error:", err);
    alert("Vote failed: " + (err?.message || "Missing permissions"));
  }
};

  // ✅ Handle comment submission
const handleCommentSubmit = async () => {
  if (!comment.trim() || !checkId || !user) return;

  try {
    const voteRef = doc(collection(db, "checks", checkId, "votes"), user.uid);

    await setDoc(voteRef, {
      voterId: user.uid,           // <-- include voterId again
      vote: 1,                     // treat comment as supportive by default
      comment: comment.trim(),
      timestamp: serverTimestamp(),
    });

    setShowComment(false);
    setComment("");
    setVoted(true);
    alert("💬 Thanks for your input!");
  } catch (err) {
    console.error("Comment error:", err);
    alert("Comment failed: " + (err?.message || "Missing permissions"));
  }
};

  // === UI Helper Styles ===
  const getVerdictStyle = (verdict) => {
    if (typeof verdict !== "string")
      return {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: "?",
      };

    const lower = verdict.toLowerCase();
    if (lower.includes("true"))
      return {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: "✓",
      };
    else if (lower.includes("false"))
      return {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        icon: "✗",
      };
    else
      return {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: "?",
      };
  };

  const getBarColor = (val) => {
    if (val > 80) return "#10b981";
    if (val > 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 73px)",
        padding: "3rem 1rem",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "0.5rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          Verify News Credibility
        </h1>
        <p style={{ fontSize: "1.25rem", color: "rgba(255, 255, 255, 0.9)" }}>
          AI-powered fact-checking at your fingertips
        </p>
      </div>

      {/* Main Box */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Text Area */}
        <textarea
          style={{
            width: "100%",
            padding: "1rem",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "1.25rem",
            resize: "vertical",
            minHeight: "150px",
            outline: "none",
            transition: "border 0.3s ease",
          }}
          placeholder="Paste a news headline, article excerpt, or claim to verify..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Analyze Button */}
        <button
          onClick={handleCheck}
          disabled={loading || !text.trim()}
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "1rem",
            background:
              loading || !text.trim()
                ? "#cbd5e0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.25rem",
            fontWeight: "600",
            cursor: loading || !text.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing..." : "🔍 Analyze Statement"}
        </button>

        {/* Result Section */}
        {result && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem",
              background: "#f7fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  ...getVerdictStyle(result),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {getVerdictStyle(result).icon}
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#718096",
                    fontWeight: "500",
                  }}
                >
                  Analysis Result
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.75rem",
                    fontWeight: "600",
                    color: "#2d3748",
                  }}
                >
                  {result.includes("Error") ? "Error" : "Verdict"}
                </p>
              </div>
            </div>

            {/* Output Text */}
            <div
              style={{
                padding: "1rem",
                background: "white",
                borderRadius: "8px",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                color: "#4a5568",
                whiteSpace: "pre-wrap",
              }}
            >
              {result}
            </div>

            {/* Confidence Bar */}
            {score !== null && (
              <div style={{ marginTop: "1.5rem" }}>
                <p
                  style={{
                    marginBottom: "0.25rem",
                    fontWeight: "600",
                    color: "#2d3748",
                  }}
                >
                  Confidence Score: {score}%
                </p>
                <div
                  style={{
                    background: "#e2e8f0",
                    borderRadius: "8px",
                    height: "12px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${score}%`,
                      background: getBarColor(score),
                      borderRadius: "8px",
                      transition: "width 1.5s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {/* ✅ Voting Buttons */}
            {checkId && !voted && (
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={() => handleVote(1)}
                  style={{
                    background: "#dcfce7",
                    border: "1px solid #16a34a",
                    color: "#166534",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  👍 Accurate
                </button>
                <button
                  onClick={() => handleVote(-1)}
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #dc2626",
                    color: "#991b1b",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  👎 Inaccurate
                </button>
                <button
                  onClick={() => setShowComment(true)}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #94a3b8",
                    color: "#475569",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  💬 Comment
                </button>
              </div>
            )}

            {/* 💬 Comment Box */}
            {showComment && (
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your reasoning..."
                  style={{
                    width: "80%",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    resize: "vertical",
                  }}
                />
                <br />
                <button
                  onClick={handleCommentSubmit}
                  style={{
                    marginTop: "0.5rem",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "2rem",
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "0.875rem",
        }}
      >
        <p>💡 Tip: Provide specific claims or statements for more accurate results</p>
      </div>
    </div>
  );
}
