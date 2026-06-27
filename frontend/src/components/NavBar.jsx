import { useLocation, useNavigate } from "react-router-dom";
import { esDemoMode, cerrarSesion } from "../utils/auth";
import "./NavBar.css";

const TABS = [
  { path: "/mis-outfits",    label: "Mis Outfits" },
  { path: "/recomendaciones", label: "Closy" },
  { path: "/mi-closet",      label: "Mi Closet" },
  { path: "/pizarron",       label: "Pizarrón" },
];

const SIN_NAV = ["/login", "/registro"];

export default function NavBar() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const demo = esDemoMode();

  if (SIN_NAV.includes(pathname)) return null;

  return (
    <>
      {demo && (
        <div className="demo-banner">
          Modo demo
          <button
            className="demo-banner__salir"
            onClick={() => { cerrarSesion(); navigate("/login"); }}
          >
            Salir
          </button>
        </div>
      )}
      <nav className="navbar-burbuja">
        {TABS.map((tab) => {
          const activo =
            pathname === tab.path ||
            (pathname === "/subir-prenda" && tab.path === "/mi-closet");
          return (
            <button
              key={tab.path}
              className={`navbar-burbuja__btn${activo ? " navbar-burbuja__btn--activo" : ""}`}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
            >
              <span className="navbar-burbuja__label">{tab.label}</span>
            </button>
          );
        })}
        {!demo && (
          <button
            className="navbar-burbuja__btn navbar-burbuja__btn--salir"
            onClick={() => { cerrarSesion(); navigate("/login"); }}
            aria-label="Cerrar sesión"
          >
            <span className="navbar-burbuja__label">Salir</span>
          </button>
        )}
      </nav>
    </>
  );
}
