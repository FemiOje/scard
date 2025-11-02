import React from "react";
import { Link } from "react-router-dom";

export const NotFoundScreen: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 100%)",
        color: "#fff",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "6rem", margin: 0, color: "#FF6B35" }}>404</h1>
      <h2 style={{ fontSize: "2rem", margin: "1rem 0", fontWeight: "normal" }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: "1.2rem", margin: "1rem 0", opacity: 0.8 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          marginTop: "2rem",
          padding: "0.75rem 2rem",
          backgroundColor: "rgba(255, 107, 53, 0.9)",
          color: "white",
          textDecoration: "none",
          border: "2px solid #FF6B35",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          boxShadow: "0 0 20px rgba(255, 107, 53, 0.4)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 140, 0, 0.9)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 107, 53, 0.9)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        ← Return to Home
      </Link>
    </div>
  );
};

export default NotFoundScreen;

