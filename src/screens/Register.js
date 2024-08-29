import React, { useState } from "react";
import "../css/register.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Register = (props) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastName] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !pass || !firstname || !lastname) {
      setMessage("Nisu ispunjena sva polja");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/register", {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: pass,
      });

      if (response.status === 200) {
        const parentId = response.data.parentId;
        setMessage("");

        navigate("/homepage");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Invalid username or password
        setMessage("Nevalidan e-mail ili lozinka");
      } else {
        // Other errors
        setMessage("Greška");
      }
    }
  };

  /* const navigateToHomePage = () => {
    navigate("/homepage");
  };
*/
  return (
    <>
      <form>
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
                to={"/login"}
                style={{
                  textDecoration: "none",
                  color: "#000",
                  transition: "color 0.3s",
                }}
                activestyle={{ color: "blue" }}
              >
                Prijavi se
              </Link>
            </li>
          </ul>
        </nav>
      </form>
      <div className="auth-form-container">
        <h2>Registracija</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Ime</label>
          <input
            value={firstname}
            name="firstname"
            onChange={(e) => setFirstname(e.target.value)}
            id="firstname"
            placeholder="Ime"
            style={{ color: "black" }} // Set text color to black
          />
          <label htmlFor="lastname">Prezime</label>
          <input
            value={lastname}
            name="lastname"
            onChange={(e) => setLastName(e.target.value)}
            id="lastname"
            placeholder="Prezime"
            style={{ color: "black" }} // Set text color to black
          />
          <label htmlFor="email">E-mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="vasemail@gmail.com"
            id="email"
            name="email"
            style={{ color: "black" }} // Set text color to black
          />
          <label htmlFor="password">Lozinka</label>
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            placeholder="********"
            id="password"
            name="password"
            style={{ color: "black" }} // Set text color to black
          />

          {message ? <p className="message">{message}</p> : null}
          <div className="containerRegistr">
            <button type="submit" className="registr-button">
              Registruj se
            </button>
          </div>
        </form>
        <Link to="/login" className="link-btn">
          Već imate račun? Prijavite se ovdje.
        </Link>
      </div>
    </>
  );
};

export default Register;
