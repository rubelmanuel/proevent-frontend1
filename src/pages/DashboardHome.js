import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiClock, FiFileText, FiRefreshCw } from "react-icons/fi";
import './../css/Dashboard.css';

const API = "http://localhost:8080";

function DashboardHome() {
  const [sortOrder, setSortOrder] = useState("desc");
  const [departmentFilter, setDepartmentFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("");
  const [eventRequests, setEventRequests] = useState([]);
  const [avRequests, setAvRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAV, setLoadingAV] = useState(true);
  const [error, setError] = useState("");
  const [errorAV, setErrorAV] = useState("");

  useEffect(() => {
    cargarEventos();
    cargarAudiovisuales();
  }, []);

  const cargarAudiovisuales = async () => {
    setLoadingAV(true);
    setErrorAV("");
    try {
      const res = await fetch(`${API}/audiovisual`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvRequests(data);
      } else {
        setErrorAV("Error al cargar solicitudes audiovisuales.");
      }
    } catch (err) {
      setErrorAV("No se pudo conectar al servidor para audiovisuales.");
    } finally {
      setLoadingAV(false);
    }
  };

  const cargarEventos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/eventos`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEventRequests(data);
      } else {
        setError("Error al cargar eventos.");
      }
    } catch (err) {
      setError("No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id_evento, nuevoEstado) => {
    try {
      const res = await fetch(`${API}/eventos/${id_evento}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarEventos();
      } else {
        alert("Error al cambiar el estado.");
      }
    } catch {
      alert("No se pudo conectar al servidor.");
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getStatusClass = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "pending";
      case "Aprobado":
        return "approved";
      case "Rechazado":
        return "rejected";
      case "Finalizado":
        return "approved";
      default:
        return "pending";
    }
  };

  const departamentosUnicos = ["Todos", ...new Set(eventRequests.map((e) => e.dependencia).filter(Boolean))];

  const filteredRequests = eventRequests
    .filter((req) => {
      const matchDept = departmentFilter === "Todos" || req.dependencia === departmentFilter;
      const matchStatus = statusFilter === "Todos" || req.estado === statusFilter;
      const matchDate = !dateFilter || (req.fecha_inicio && req.fecha_inicio.startsWith(dateFilter));
      return matchDept && matchStatus && matchDate;
    })
    .sort((a, b) => {
      const dA = new Date(a.fecha_inicio).getTime();
      const dB = new Date(b.fecha_inicio).getTime();
      return sortOrder === "asc" ? dA - dB : dB - dA;
    });

  const totalSolicitudes = eventRequests.length;
  const pendientes = eventRequests.filter((e) => e.estado === "Pendiente").length;
  const finalizados = eventRequests.filter((e) => e.estado === "Finalizado" || e.estado === "Aprobado").length;

  return (
    <>
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon requests">
            <FiFileText aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-label">SOLICITUDES</span>
            <h3>{totalSolicitudes}</h3>
            <span className="stat-trend positive">Total de eventos registrados</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-label">PENDIENTES</span>
            <h3>{pendientes}</h3>
            <span className="stat-trend warning">Eventos próximos a realizarse</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <FiCheckCircle aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-label">FINALIZADOS</span>
            <h3>{finalizados}</h3>
            <span className="stat-trend positive stat-trend-with-icon">
              <FiCheckCircle aria-hidden="true" />
              Eventos concluidos o aprobados
            </span>
          </div>
        </div>
      </div>

      <div className="recent-requests-section">
        <div className="section-header">
          <h3>Solicitudes de Eventos</h3>
          <div className="section-filters">
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              {departamentosUnicos.map((d) => (
                <option key={d} value={d}>{d === "Todos" ? "Todos los Departamentos" : d}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button className="sort-btn" onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? "↑↓ Asc" : "↓↑ Desc"}
            </button>
            <button
              className="sort-btn icon-only-btn"
              onClick={cargarEventos}
              title="Recargar"
              aria-label="Recargar eventos"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Cargando eventos...</p>
          ) : error ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#dc2626" }}>{error}</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>NOMBRE DEL EVENTO</th>
                  <th>DEPENDENCIA</th>
                  <th>TIPO</th>
                  <th>FECHA INICIO</th>
                  <th>RECINTO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id_evento}>
                    <td>
                      <strong>{req.nombre}</strong><br />
                      <span className="text-muted">#EVT-{req.id_evento}</span>
                    </td>
                    <td>{req.dependencia || "—"}</td>
                    <td><span className="badge">{req.tipo_evento}</span></td>
                    <td>{formatFecha(req.fecha_inicio)}</td>
                    <td>{req.recinto || "—"}</td>
                    <td>
                      <span className={`status ${getStatusClass(req.estado)}`}>
                        {req.estado || "Pendiente"}
                      </span>
                    </td>
                    <td>
                      <select
                        value={req.estado || "Pendiente"}
                        onChange={(e) => handleCambiarEstado(req.id_evento, e.target.value)}
                        style={{ fontSize: "12px", padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Rechazado">Rechazado</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No se encontraron eventos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECCIÓN AUDIOVISUALES */}
      <div className="recent-requests-section" style={{ marginTop: '40px' }}>
        <div className="section-header">
          <h3>Solicitudes de Servicios Audiovisuales</h3>
          <div className="section-filters">
            <button
              className="sort-btn icon-only-btn"
              onClick={cargarAudiovisuales}
              title="Recargar Audiovisuales"
              aria-label="Recargar audiovisuales"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="table-container">
          {loadingAV ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Cargando solicitudes audiovisuales...</p>
          ) : errorAV ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#dc2626" }}>{errorAV}</p>
          ) : avRequests.length === 0 ? (
            <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>No hay solicitudes audiovisuales registradas.</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>EQUIPO SOLICITADO</th>
                  <th>CANTIDAD</th>
                  <th>EVENTO ASOCIADO</th>
                  <th>FECHA EVENTO</th>
                  <th>UBICACIÓN</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {avRequests.map((av) => (
                  <tr key={av.id_servicio}>
                    <td>
                      <strong>{av.equipo}</strong><br />
                      <span className="text-muted">#AV-{av.id_servicio}</span>
                    </td>
                    <td><span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>x{av.cantidad || 1}</span></td>
                    <td>
                      <strong>{av.nombre_evento}</strong><br/>
                      <span className="text-muted">#EVT-{av.id_evento}</span>
                    </td>
                    <td>{formatFecha(av.fecha_evento)}</td>
                    <td>{av.ubicacion || "—"}</td>
                    <td>
                      <span className={`status ${getStatusClass(av.estado_av)}`}>
                        {av.estado_av || "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardHome;
