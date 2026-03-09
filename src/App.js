import { useState } from "react";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("welcome");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);

  return (
    <div>
      {page === "login" ? (
        <Login
          onLogin={(usuarioData) => {
            setIsLoggedIn(true);
            setUsuario(usuarioData);
            setPage("dashboard");
          }}
          onBackClick={() => setPage("welcome")}
        />
      ) : page === "welcome" ? (
        <Welcome
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setPage("login")}
          onLogoutClick={() => {
            setIsLoggedIn(false);
            setUsuario(null);
          }}
        />
      ) : (
        <Dashboard
          usuario={usuario}
          onLogoutClick={() => {
            setIsLoggedIn(false);
            setUsuario(null);
            setPage("welcome");
          }}
        />
      )}
    </div>
  );
}

export default App;