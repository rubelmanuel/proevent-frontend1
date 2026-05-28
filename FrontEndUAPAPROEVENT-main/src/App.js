import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "react-hot-toast";

function App() {
  const [page, setPage] = useState(() => {
    return sessionStorage.getItem("page") || "welcome";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });
  const [usuario, setUsuario] = useState(() => {
    const savedUser = sessionStorage.getItem("usuario");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("page", page);
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (usuario) {
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      sessionStorage.removeItem("usuario");
    }
  }, [usuario]);

  useEffect(() => {
    // Detectar token en la URL (ej: /reset-password/TOKEN)
    const path = window.location.pathname;
    if (path.startsWith("/reset-password/")) {
      const token = path.split("/")[2];
      setResetToken(token);
      setPage("reset-password");
    }
  }, []);

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      {page === "reset-password" ? (
        <ResetPassword 
          token={resetToken} 
          onBackClick={() => {
            window.history.pushState({}, "", "/");
            setPage("login");
          }} 
        />
      ) : page === "login" ? (
        <Login
          onLogin={(usuarioData) => {
            setIsLoggedIn(true);
            setUsuario(usuarioData);
            setPage("dashboard");
          }}
          onBackClick={() => setPage("welcome")}
          onForgotPasswordClick={() => setPage("forgot-password")}
        />
      ) : page === "forgot-password" ? (
        <ForgotPassword 
          onBackClick={() => setPage("login")} 
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