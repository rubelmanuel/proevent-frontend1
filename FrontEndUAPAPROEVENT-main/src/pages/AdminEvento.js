import React, { useState, useEffect } from "react";
import "./../css/AjustesUsuarios.css";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const API = "http://localhost:8080";

export default function AdminEvento({ usuario }) {
  const [activeTab, setActiveTab] = useState("tipos"); // tipos | corporativo | alimentos
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [nombre, setNombre] = useState("");

  const getConfig = () => {
    switch(activeTab) {
      case "tipos": return { endpoint: "tipos-evento", idField: "id_tipo_evento", title: "Tipos de Evento" };
      case "corporativo": return { endpoint: "tipos-detalle-corporativo", idField: "id_detalle_corp", title: "Detalles Corporativos" };
      case "alimentos": return { endpoint: "alimentos", idField: "id_alimento", title: "Servicios de Alimentos" };
      default: return {};
    }
  };

  useEffect(() => {
    cargarDatos();
    setIsEditing(false);
    setNombre("");
    setCurrentPage(1); // Reset al cambiar de tab
  }, [activeTab]);

  const cargarDatos = () => {
    const { endpoint } = getConfig();
    setLoading(true);
    fetch(`${API}/${endpoint}`)
      .then(res => res.json())
      .then(data => setDataList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error", err))
      .finally(() => setLoading(false));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const { endpoint } = getConfig();
    const url = isEditing ? `${API}/${endpoint}/${currentId}` : `${API}/${endpoint}`;
    const method = isEditing ? "PUT" : "POST";

    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        setNombre("");
        setIsEditing(false);
        setCurrentId(null);
        cargarDatos();
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

  const handleEditar = (item) => {
    const { idField } = getConfig();
    setIsEditing(true);
    setCurrentId(item[idField]);
    setNombre(item.nombre);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta opción?")) return;
    const { endpoint } = getConfig();
    setLoading(true);
    try {
      const res = await fetch(`${API}/${endpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarDatos();
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
  const totalPages = Math.ceil(dataList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataList.slice(indexOfFirstItem, indexOfLastItem);

  if (usuario?.rol !== "Administrador de Evento" && usuario?.rol !== "Administrador") {
    return <div style={{ padding: "2rem" }}>No tienes permisos para acceder a esta sección.</div>;
  }

  const { title, idField } = getConfig();

  return (
    <div className="ajustes-page fade-in" style={{maxWidth: '900px', margin: '0 auto'}}>
      <div className="ajustes-page-header">
        <h1>Mantenimiento de Catálogos de Eventos</h1>
        <p>Administra las opciones prestablecidas que se muestran en el formulario de solicitud de eventos.</p>
      </div>

      {/* TABS */}
      <div className="ajustes-tabs">
        <button 
          className={`ajustes-tab ${activeTab === "tipos" ? "active" : ""}`}
          onClick={() => setActiveTab("tipos")}
        >
          Tipos de Evento
        </button>
        <button 
          className={`ajustes-tab ${activeTab === "corporativo" ? "active" : ""}`}
          onClick={() => setActiveTab("corporativo")}
        >
          Detalles Corporativos
        </button>
        <button 
          className={`ajustes-tab ${activeTab === "alimentos" ? "active" : ""}`}
          onClick={() => setActiveTab("alimentos")}
        >
          Opciones de Alimentos
        </button>
      </div>

      <div className="ajustes-form-card" style={{ marginBottom: "24px" }}>
        <div className="ajustes-form-section">
          <h3 className="ajustes-section-title">{isEditing ? `Editar opción de ${title}` : `Nueva opción para ${title}`}</h3>
          <p className="ajustes-section-desc">Escribe el nombre de la opción para agregarla al catálogo.</p>
          
          <form onSubmit={handleGuardar} style={{ display: "flex", gap: "14px", alignItems: "flex-end", marginTop: "15px", flexWrap: "wrap" }}>
            <div className="ajustes-form-group" style={{ flex: 1, minWidth: "250px" }}>
              <label>Nombre de la Opción</label>
              <input 
                type="text" 
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Escriba aquí..."
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-ajustes-primary" disabled={loading} style={{ height: "42px", display: "flex", alignItems: "center", gap: "8px" }}>
                {isEditing ? "Guardar" : <><FiPlus /> Agregar</>}
              </button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setNombre(""); }} className="btn-ajustes-secondary" style={{ height: "42px" }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="ajustes-table-card">
        <div className="ajustes-table-toolbar">
          <h2>Catálogo Configurado ({title})</h2>
        </div>
        <div className="table-container">
          <table className="ajustes-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Descripción en el catálogo</th>
                <th style={{textAlign: 'right'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(item => (
                <tr key={item[idField]} className="table-hover-row">
                  <td><div className="ajustes-id-badge">#{item[idField]}</div></td>
                  <td><strong>{item.nombre}</strong></td>
                  <td style={{textAlign: 'right'}}>
                    <div className="ajustes-actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="ajustes-action-btn edit" onClick={() => handleEditar(item)} title="Editar"><FiEdit2 /></button>
                      <button className="ajustes-action-btn delete" onClick={() => handleEliminar(item[idField])} title="Eliminar"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {dataList.length === 0 && (
                <tr><td colSpan="3" style={{textAlign: 'center', padding: '40px', color: '#64748B'}}>Este catálogo está vacío.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {dataList.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Mostrando <strong>{indexOfFirstItem + 1}</strong> - <strong>{Math.min(indexOfLastItem, dataList.length)}</strong> de <strong>{dataList.length}</strong> opciones
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
