import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./screens/WelcomeScreen";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import HomePage from "./screens/HomePage";
import EditProfile from "./screens/EditProfile";
import Statistics from "./screens/Statistics";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
