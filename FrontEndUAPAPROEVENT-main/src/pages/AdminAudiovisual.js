import React, { useState, useEffect } from "react";
import "./../css/AjustesUsuarios.css"; // Usa los estilos base de admin
import { FiEdit2, FiTrash2, FiPlus, FiMonitor, FiSpeaker, FiMic, FiVideo, FiRadio, FiSun, FiCast } from "react-icons/fi";

const API = "http://localhost:8080";

const ICON_OPTIONS = [
  "FiMonitor", "FiSpeaker", "FiMic", "FiVideo", "FiRadio", "FiSun", "FiCast"
];

export default function AdminAudiovisual({ usuario }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form estado
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState("FiMonitor");
  const [cantidad_total, setCantidadTotal] = useState(0);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = () => {
    setLoading(true);
    fetch(`${API}/equipos-audiovisuales`)
      .then(res => res.json())
      .then(data => {
        setEquipos(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error cargando equipos", err))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const url = isEditing ? `${API}/equipos-audiovisuales/${currentId}` : `${API}/equipos-audiovisuales`;
    const method = isEditing ? "PUT" : "POST";

    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, icono, cantidad_total })
      });
      if (res.ok) {
        setNombre("");
        setIcono("FiMonitor");
        setCantidadTotal(0);
        setIsEditing(false);
        setCurrentId(null);
        cargarEquipos();
      } else {
        const err = await res.json();
        alert(err.mensaje || "Error al guardar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (eq) => {
    setIsEditing(true);
    setCurrentId(eq.id_equipo);
    setNombre(eq.nombre);
    setIcono(eq.icono || "FiMonitor");
    setCantidadTotal(eq.cantidad_total || 0);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este equipo del catálogo?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/equipos-audiovisuales/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarEquipos();
      } else {
        alert("Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Paginación
  const totalPages = Math.ceil(equipos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = equipos.slice(indexOfFirstItem, indexOfLastItem);

  if (usuario?.rol !== "Administrador de Audiovisual" && usuario?.rol !== "Administrador") {
    return <div style={{ padding: "2rem" }}>No tienes permisos para acceder a esta sección.</div>;
  }
  return (
    <div className="admin-page-container fade-in">
      <div className="admin-controls-card">
        <div className="controls-header">
          <div className="title-section">
            <FiMonitor className="header-icon" />
            <div>
              <h3>Catálogo de Equipos Audiovisuales</h3>
              <p className="subtitle">Administra los equipos y servicios audiovisuales que los usuarios pueden solicitar.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="saas-panel-card" style={{ marginBottom: "30px" }}>
        <div className="panel-header">
          <h4>{isEditing ? "Editar Equipo" : "Agregar Nuevo Equipo"}</h4>
        </div>
        <div className="panel-body">
          <p className="ajustes-section-desc" style={{ marginBottom: '15px' }}>Ingresa los detalles del equipo para el catálogo.</p>
          
          <form onSubmit={handleGuardar} style={{ display: "flex", gap: "14px", alignItems: "flex-end", marginTop: "15px", flexWrap: "wrap" }}>
            <div className="ajustes-form-group" style={{ flex: "1 1 250px" }}>
              <label>Nombre del Equipo</label>
              <input 
                type="text" 
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Proyector 4K"
              />
            </div>
            <div className="ajustes-form-group" style={{ flex: "1 1 200px" }}>
              <label>Ícono sugerido</label>
              <select 
                value={icono} 
                onChange={e => setIcono(e.target.value)}
              >
                <option value="FiMonitor">Monitor / Pantalla</option>
                <option value="FiSpeaker">Sonido</option>
                <option value="FiMic">Microfonía</option>
                <option value="FiVideo">Video / Cámara</option>
                <option value="FiRadio">Transmisión / Radio</option>
                <option value="FiSun">Iluminación</option>
                <option value="FiCast">Proyección Local</option>
              </select>
            </div>
            <div className="ajustes-form-group" style={{ flex: "0 0 100px" }}>
              <label>Cant. Total</label>
              <input 
                type="number" 
                required
                min="0"
                value={cantidad_total}
                onChange={(e) => setCantidadTotal(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-ajustes-primary" disabled={loading} style={{ height: "42px", display: "flex", alignItems: "center", gap: "8px" }}>
                {isEditing ? "Guardar" : <><FiPlus /> Agregar</>}
              </button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setNombre(""); setCantidadTotal(0); }} className="btn-ajustes-secondary" style={{ height: "42px" }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="saas-panel-card">
        <div className="panel-header">
          <h4>Equipos Configurados</h4>
        </div>
        <div className="panel-body" style={{ overflowX: 'auto', padding: '0' }}>
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Equipo</th>
                <th>Ícono Asignado</th>
                <th>Cant. Total</th>
                <th style={{textAlign: 'right'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(eq => (
                <tr key={eq.id_equipo} className="table-hover-row">
                  <td><div className="ajustes-id-badge">#{eq.id_equipo}</div></td>
                  <td>
                    <div className="ajustes-user-cell">
                      <div className="ajustes-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        {eq.icono === 'FiMonitor' && <FiMonitor />}
                        {eq.icono === 'FiSpeaker' && <FiSpeaker />}
                        {eq.icono === 'FiMic' && <FiMic />}
                        {eq.icono === 'FiVideo' && <FiVideo />}
                        {eq.icono === 'FiRadio' && <FiRadio />}
                        {eq.icono === 'FiSun' && <FiSun />}
                        {eq.icono === 'FiCast' && <FiCast />}
                        {!["FiMonitor", "FiSpeaker", "FiMic", "FiVideo", "FiRadio", "FiSun", "FiCast"].includes(eq.icono) && <FiMonitor />}
                      </div>
                      <div className="ajustes-user-name">{eq.nombre}</div>
                    </div>
                  </td>
                  <td><span className="role-badge staff">{eq.icono}</span></td>
                  <td><strong>{eq.cantidad_total || 0}</strong> unidades</td>
                  <td style={{textAlign: 'right'}}>
                    <div className="ajustes-actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="ajustes-action-btn edit" onClick={() => handleEditar(eq)} title="Editar"><FiEdit2 /></button>
                      <button className="ajustes-action-btn delete" onClick={() => handleEliminar(eq.id_equipo)} title="Eliminar"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {equipos.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748B'}}>No hay equipos configurados en el catálogo.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {equipos.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Mostrando <strong>{indexOfFirstItem + 1}</strong> - <strong>{Math.min(indexOfLastItem, equipos.length)}</strong> de <strong>{equipos.length}</strong> equipos
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="page-number">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
