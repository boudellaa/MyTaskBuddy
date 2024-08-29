import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const ForgotPassword = (props) => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  async function sentForum(event) {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/send-email", {
        to: email,
      });

      if (response.status === 200) {
        setMessage("Uspješno poslana šifra!");

        navigate("/homepage");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Invalid username or password
        setMessage("Greška prilikom promjene lozinke!");
      } else {
        // Other errors
        setMessage("Greška");
      }
    }
  }

  return (
    <>
      <nav
        style={{
          backgroundColor: "#f8f9fa",
          padding: "10px 20px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to={"/"}
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "#000",
          }}
        >
          <img
            src="/assets/images/logo.png"
            alt="MyTaskBuddy Logo"
            width="30"
            height="30"
            style={{ marginRight: "10px" }}
          />
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>
            MyTaskBuddy
          </span>
        </Link>

        <ul
          style={{
            display: "flex",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <li style={{ marginRight: "35px" }}>
            <Link
              to={"/"}
              style={{
                textDecoration: "none",
                color: "#000",
                transition: "color 0.3s",
              }}
              activestyle={{ color: "blue" }}
            >
              Početna
            </Link>
          </li>
          <li style={{ marginRight: "35px" }}>
            <Link
              to={"/register"}
              style={{
                textDecoration: "none",
                color: "#000",
                transition: "color 0.3s",
              }}
              activestyle={{ color: "blue" }}
            >
              Registruj se
            </Link>
          </li>
        </ul>
      </nav>
      <div className="auth-form-container">
        <h2>Zaboravili ste lozinku?</h2>
        <form className="login-form" onSubmit={sentForum}>
          <label htmlFor="email">Unesite Vaš e-mail</label>
          <input
            value={email}
            onChange={handleChange}
            type="email"
            placeholder="vasemail@gmail.com"
            id="email"
            name="email"
            style={{ color: "black" }} // Set text color to black
          />

          <div className="container">
            <button type="submit" className="login-button">
              Pošalji
            </button>
          </div>
          <p>{message}</p>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;
