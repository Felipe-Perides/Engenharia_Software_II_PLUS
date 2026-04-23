import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import lazy do microfrontend remoto
const LoginPage = lazy(() => import("mfe_auth/LoginPage"));

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function Dashboard() {
  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Plus — Dashboard</h1>
      <p>Bem-vindo ao sistema de gestão de estoque.</p>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Carregando...</p>}>
        <Routes>
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={() => (window.location.href = "/")}
              />
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
