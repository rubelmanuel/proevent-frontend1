import React, { useState } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import "./../css/Dashboard.css";
import uapaLogo from "./../img/Logo-blanco-UAPA.png";
import searchIcon from "./../img/search.png";
import dashboardIcon from "./../img/dashboard.png";
import eventosIcon from "./../img/eventos.png";
import audiovisualIcon from "./../img/audiovisual.png";
import evaluacionIcon from "./../img/evaluacion.png";
import soporteIcon from "./../img/soporte.png";

import DashboardHome from "./DashboardHome";
import SoporteHome from "./SoporteHome";
import Eventos from "./Eventos";
import Audiovisual from "./Audiovisual";
import Evaluacion from "./Evaluacion";
import AjustesUsuarios from "./AjustesUsuarios";

function Dashboard({ onLogoutClick, usuario }) {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Dashboard":
                return <DashboardHome />;
            case "Soporte":
                return <SoporteHome />;
            case "Eventos":
                return <Eventos usuario={usuario} />;
            case "Audiovisual":
                return <Audiovisual />;
            case "Evaluación":
                return <Evaluacion />;
            case "Ajustes":
                return <AjustesUsuarios />;
            default:
                return <DashboardHome />;
        }
    };

    const getPageTitle = () => {
        switch (activeTab) {
            case "Dashboard":
                return "Dashboard de Eventos";
            case "Soporte":
                return "Centro de Soporte";
            case "Eventos":
                return "Gestión de Eventos";
            case "Audiovisual":
                return "Producción Audiovisual";
            case "Evaluación":
                return "Evaluación de Eventos";
            case "Ajustes":
                return "Ajustes de Sistema - Usuarios";
            default:
                return activeTab;
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-logo-container">
                        <img src={uapaLogo} alt="UAPA Logo" className="brand-logo-img" />
                    </div>
                    <div className="brand-text">
                        <h2>PROEVENT</h2>
                        <p>SISTEMA DE EVENTOS</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeTab === "Dashboard" ? "active" : ""} onClick={() => setActiveTab("Dashboard")}>
                            <img src={dashboardIcon} alt="Dashboard" className="nav-icon-img" />
                            Dashboard
                        </li>
                        <li className={activeTab === "Eventos" ? "active" : ""} onClick={() => setActiveTab("Eventos")}>
                            <img src={eventosIcon} alt="Eventos" className="nav-icon-img" />
                            Solicitud de Eventos
                        </li>
                        <li className={activeTab === "Audiovisual" ? "active" : ""} onClick={() => setActiveTab("Audiovisual")}>
                            <img src={audiovisualIcon} alt="Audiovisual" className="nav-icon-img" />
                            Solicitud de Audiovisual
                        </li>
                        <li className={activeTab === "Evaluación" ? "active" : ""} onClick={() => setActiveTab("Evaluación")}>
                            <img src={evaluacionIcon} alt="Evaluación" className="nav-icon-img" />
                            Evaluación
                        </li>
                        <li className={activeTab === "Soporte" ? "active" : ""} onClick={() => setActiveTab("Soporte")}>
                            <img src={soporteIcon} alt="Soporte" className="nav-icon-img" />
                            Soporte
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-user-section">
                    <div className={`user-logout-menu ${userMenuOpen ? "open" : ""}`}>
                        <button className="logout-button" onClick={onLogoutClick}>
                            <FiLogOut className="action-icon" aria-hidden="true" />
                            Cerrar sesión
                        </button>
                    </div>
                    <div className="user-profile-toggle" onClick={toggleUserMenu}>
                        <div className="user-avatar">
                            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "US"}
                        </div>
                        <div className="user-info">
                            <h4>{usuario?.nombre || "Usuario"}</h4>
                            <span>{usuario?.rol || "Sin rol"}</span>
                        </div>
                        {usuario?.rol === "Administrador" && (
                            <div
                                className="user-settings-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab("Ajustes");
                                }}
                                title="Ajustes de Usuario"
                            >
                                <FiSettings className="action-icon" aria-hidden="true" />
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>{getPageTitle()}</h1>
                    <div className="header-actions">
                        <div className="search-bar">
                            <img src={searchIcon} alt="Buscar" className="search-icon-img" />
                            <input
                                type="text"
                                placeholder={activeTab === "Ajustes" ? "Buscar usuario..." : "Buscar eventos o IDs..."}
                            />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="dashboard-content">{renderContent()}</div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
