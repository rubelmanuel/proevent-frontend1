import React, { useState } from "react";
import { FiLogOut, FiSettings, FiStar, FiHeadphones, FiActivity, FiUsers, FiSliders, FiList, FiCalendar, FiMonitor, FiBox, FiDollarSign, FiChevronDown, FiChevronRight, FiMenu } from "react-icons/fi";
import "./../css/Dashboard.css";
import uapaLogo from "./../img/Logo-blanco-UAPA.png";
import searchIcon from "./../img/search.png";
import dashboardIcon from "./../img/dashboard.png";
import eventosIcon from "./../img/eventos.png";
import audiovisualIcon from "./../img/audiovisual.png";

import DashboardHome from "./DashboardHome";
import Eventos from "./Eventos";
import Audiovisual from "./Audiovisual";
import AjustesUsuarios from "./AjustesUsuarios";
import Bitacora from "./Bitacora";
import SoporteHome from "./SoporteHome";
import Evaluacion from "./Evaluacion";
import AdminAudiovisual from "./AdminAudiovisual";
import InventarioAudiovisual from "./InventarioAudiovisual";
import AdminEvento from "./AdminEvento";
import Calendario from "./Calendario";
import GestionSolicitudesAV from "./GestionSolicitudesAV";
import PoaAdmin from "./PoaAdmin";
import VisualizarEvaluaciones from "./VisualizarEvaluaciones";
import NotificationBell from "./NotificationBell";
import GestionEventos from "./GestionEventos";

function Dashboard({ usuario, isLoginGoogle, onLogoutClick }) {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventoEvalId, setEventoEvalId] = useState(null);

    const [openMenus, setOpenMenus] = useState({
        eventos: true,
        audiovisual: true,
        admin: true
    });

    const toggleMenu = (menu) => setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Dashboard":
                return <DashboardHome 
                    usuario={usuario} 
                    searchTerm={searchTerm} 
                    onEditEvent={(evt) => { setEditingEvent(evt); setActiveTab("Eventos"); }} 
                    setActiveTab={setActiveTab}
                />;
            case "GestionEventos":
                return <GestionEventos
                    usuario={usuario}
                    searchTerm={searchTerm}
                    onEditEvent={(evt) => { setEditingEvent(evt); setActiveTab("Eventos"); }}
                />;
            case "Eventos":
                return <Eventos 
                    usuario={usuario} 
                    editingEvent={editingEvent} 
                    setEditingEvent={setEditingEvent} 
                />;
            case "Audiovisual":
                return <Audiovisual usuario={usuario} />;
            case "Ajustes":
                return <AjustesUsuarios usuario={usuario} />;
            case "Soporte":
                return <SoporteHome usuario={usuario} />;
            case "Evaluacion":
                return <Evaluacion usuario={usuario} eventoEvalId={eventoEvalId} onEvalConsumed={() => setEventoEvalId(null)} />;
            case "VisualizarEvaluaciones":
                return <VisualizarEvaluaciones searchTerm={searchTerm} />;
            case "Bitacora":
                return <Bitacora />;
            case "AdminAudiovisual":
                return <AdminAudiovisual usuario={usuario} />;
            case "InventarioAV":
                return <InventarioAudiovisual usuario={usuario} />;
            case "AdminEvento":
                return <AdminEvento usuario={usuario} />;
            case "Calendario":
                return <Calendario usuario={usuario} />;
            case "GestionSolicitudes":
                return <GestionSolicitudesAV usuario={usuario} />;
            case "PoaAdmin":
                return <PoaAdmin 
                    usuario={usuario} 
                    searchTerm={searchTerm} 
                />;
            default:
                return <DashboardHome usuario={usuario} setActiveTab={setActiveTab} />;
        }
    };

    const getPageTitle = () => {
        switch (activeTab) {
            case "Dashboard":
                return "Dashboard de Eventos";
            case "GestionEventos":
                return "Historial y Gestión de Eventos";
            case "Eventos":
                return "Nueva Solicitud de Evento";
            case "Audiovisual":
                return "Producción Audiovisual";
            case "Ajustes":
                return "Ajustes de Sistema - Usuarios";
            case "Soporte":
                return "Soporte y Ayuda";
            case "Evaluacion":
                return "Evaluación de Servicios";
            case "Bitacora":
                return "Actividad de Usuario";
            case "AdminAudiovisual":
                return "Catálogo Audiovisual";
            case "InventarioAV":
                return "Inventario Audiovisual";
            case "AdminEvento":
                return "Catálogos de Eventos";
            case "Calendario":
                return "Calendario de Eventos";
            case "GestionSolicitudes":
                return "Gestión de Solicitudes Audiovisuales";
            case "PoaAdmin":
                return "Plan Operativo Anual";
            case "VisualizarEvaluaciones":
                return "Historial de Evaluaciones";
            default:
                return activeTab;
        }
    };

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
            <aside className={`dashboard-sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo-container">
                        <img src={uapaLogo} alt="UAPA Logo" className="brand-logo-img" />
                    </div>

                    <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isSidebarOpen ? "Colapsar menú" : "Expandir menú"}>
                        <FiChevronRight className="toggle-chevron" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li className={activeTab === "Dashboard" ? "active" : ""} onClick={() => setActiveTab("Dashboard")}>
                            <img src={dashboardIcon} alt="Dashboard" className="nav-icon-img" />
                            {isSidebarOpen && <span>Dashboard</span>}
                        </li>
                        <li className={activeTab === "Calendario" ? "active" : ""} onClick={() => setActiveTab("Calendario")}>
                            <FiCalendar className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                            {isSidebarOpen && <span>Calendario</span>}
                        </li>

                        {(usuario?.rol !== "Administrador de Audiovisual" && usuario?.rol !== "Administrador V-A-F") && (
                            <>
                                <li className="nav-group-header" onClick={() => toggleMenu('eventos')}>
                                    {isSidebarOpen ? (
                                        <>
                                            <span>Módulo Eventos</span>
                                            {openMenus.eventos ? <FiChevronDown className="action-icon" /> : <FiChevronRight className="action-icon" />}
                                        </>
                                    ) : (
                                        <span className="dot-header">•</span>
                                    )}
                                </li>
                                <ul className={`nav-submenu ${openMenus.eventos && isSidebarOpen ? 'open' : ''}`}>
                                    <li className={activeTab === "Eventos" ? "active" : ""} onClick={() => setActiveTab("Eventos")}>
                                        <img src={eventosIcon} alt="Eventos" className="nav-icon-img" />
                                        Solicitud de Eventos
                                    </li>
                                    <li className={activeTab === "GestionEventos" ? "active" : ""} onClick={() => setActiveTab("GestionEventos")}>
                                        <FiSliders className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                        Gestión de Eventos
                                    </li>
                                    {(usuario?.rol === "Administrador de Evento" || usuario?.rol === "Administrador") && (
                                        <li className={activeTab === "AdminEvento" ? "active" : ""} onClick={() => setActiveTab("AdminEvento")}>
                                            <FiList className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                            Catálogos de Eventos
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}

                        {(usuario?.rol !== "Solicitante" && usuario?.rol !== "Administrador de Evento" && usuario?.rol !== "Administrador V-A-F") && (
                            <>
                                <li className="nav-group-header" onClick={() => toggleMenu('audiovisual')}>
                                    {isSidebarOpen ? (
                                        <>
                                            <span>Módulo Audiovisual</span>
                                            {openMenus.audiovisual ? <FiChevronDown className="action-icon" /> : <FiChevronRight className="action-icon" />}
                                        </>
                                    ) : (
                                        <span className="dot-header">•</span>
                                    )}
                                </li>
                                <ul className={`nav-submenu ${openMenus.audiovisual && isSidebarOpen ? 'open' : ''}`}>
                                    {usuario?.rol !== "Administrador de Audiovisual" && (
                                        <li className={activeTab === "Audiovisual" ? "active" : ""} onClick={() => setActiveTab("Audiovisual")}>
                                            <img src={audiovisualIcon} alt="Audiovisual" className="nav-icon-img" />
                                            Solicitud de Audiovisual
                                        </li>
                                    )}
                                    {(usuario?.rol === "Administrador" || usuario?.rol === "Administrador de Audiovisual") && (
                                        <>
                                            <li className={activeTab === "GestionSolicitudes" ? "active" : ""} onClick={() => setActiveTab("GestionSolicitudes")}>
                                                <FiList className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                                Gestión de solicitudes
                                            </li>
                                            <li className={activeTab === "AdminAudiovisual" ? "active" : ""} onClick={() => setActiveTab("AdminAudiovisual")}>
                                                <FiMonitor className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                                Catálogo Audiovisual
                                            </li>
                                            <li className={activeTab === "InventarioAV" ? "active" : ""} onClick={() => setActiveTab("InventarioAV")}>
                                                <FiBox className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                                Inventario Audiovisual
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </>
                        )}

                        <li className="nav-group-header" onClick={() => toggleMenu('admin')}>
                            {isSidebarOpen ? (
                                <>
                                    <span>Administración</span>
                                    {openMenus.admin ? <FiChevronDown className="action-icon" /> : <FiChevronRight className="action-icon" />}
                                </>
                            ) : (
                                <span className="dot-header">•</span>
                            )}
                        </li>
                        <ul className={`nav-submenu ${openMenus.admin && isSidebarOpen ? 'open' : ''}`}>
                            {(usuario?.rol === "Solicitante" || usuario?.rol === "Administrador") && (
                                <li className={activeTab === "Evaluacion" ? "active" : ""} onClick={() => setActiveTab("Evaluacion")}>
                                    <FiStar className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                    Evaluación
                                </li>
                            )}
                            {(usuario?.rol === "Solicitante" || usuario?.rol === "Administrador") && (
                                <li className={activeTab === "Soporte" ? "active" : ""} onClick={() => setActiveTab("Soporte")}>
                                    <FiHeadphones className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                    Soporte
                                </li>
                            )}
                            {usuario?.rol !== "Solicitante" && (
                                <li className={activeTab === "VisualizarEvaluaciones" ? "active" : ""} onClick={() => setActiveTab("VisualizarEvaluaciones")}>
                                    <FiActivity className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                    Visualizar Evaluaciones
                                </li>
                            )}
                            {usuario?.rol === "Administrador" && (
                                <li className={activeTab === "Bitacora" ? "active" : ""} onClick={() => setActiveTab("Bitacora")}>
                                    <FiUsers className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                    Actividad de usuario
                                </li>
                            )}
                            {(usuario?.rol === "Administrador" || usuario?.rol === "Administrador V-A-F") && (
                                <li className={activeTab === "PoaAdmin" ? "active" : ""} onClick={() => setActiveTab("PoaAdmin")}>
                                    <FiDollarSign className="action-icon" style={{ fontSize: '18px', opacity: 0.9, flexShrink: 0 }} aria-hidden="true" />
                                    Presupuesto POA
                                </li>
                            )}
                        </ul>
                    </ul>
                </nav>

                <div className="sidebar-user-section">
                    <div className={`user-logout-menu ${userMenuOpen ? "open" : ""}`}>
                        <button className="logout-button" onClick={onLogoutClick}>
                            <FiLogOut className="action-icon" aria-hidden="true" />
                            {isSidebarOpen && "Cerrar sesión"}
                        </button>
                    </div>
                    <div className="user-profile-toggle" onClick={toggleUserMenu}>
                        <div className="user-avatar">
                            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "US"}
                        </div>
                        {isSidebarOpen && (
                            <div className="user-info">
                                <h4>{usuario?.nombre || "Usuario"}</h4>
                                <span>{usuario?.rol || "Sin rol"}</span>
                            </div>
                        )}
                        {usuario?.rol === "Administrador" && isSidebarOpen && (
                            <div className="user-settings-icon" onClick={(e) => { e.stopPropagation(); setActiveTab("Ajustes"); }} title="Ajustes de Usuario">
                                <FiSettings className="action-icon" aria-hidden="true" />
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-left">
                        {!isSidebarOpen && (
                            <button className="header-menu-toggle" onClick={toggleSidebar}>
                                <FiMenu />
                            </button>
                        )}
                        <h1>{getPageTitle()}</h1>
                    </div>
                    <div className="header-actions">
                        <div className="search-bar">
                            <img src={searchIcon} alt="Buscar" className="search-icon-img" />
                            <input
                                type="text"
                                placeholder={activeTab === "Ajustes" ? "Buscar usuario..." : "Buscar eventos o IDs..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <NotificationBell
                            usuario={usuario}
                            onGoToEvaluacion={(eventoId) => {
                                setEventoEvalId(eventoId);
                                setActiveTab("Evaluacion");
                            }}
                            onGoToVisualizarEvaluaciones={() => setActiveTab("VisualizarEvaluaciones")}
                        />
                    </div>
                </header>

                <div className="dashboard-content-wrapper">
                    <div className="dashboard-content">{renderContent()}</div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;

