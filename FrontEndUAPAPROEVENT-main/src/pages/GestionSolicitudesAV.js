import React, { useState, useEffect } from "react";
import "./../css/Audiovisual.css";
import { FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";

const API = "http://localhost:8080";

export default function GestionSolicitudesAV({ usuario }) {
  const [solicitudesAV, setSolicitudesAV] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarSolicitudesAV();
  }, [usuario]);

  const cargarSolicitudesAV = () => {
    fetch(`${API}/audiovisual`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const agrupadas = Object.values(data.reduce((acc, req) => {
            if (!acc[req.id_evento]) {
              acc[req.id_evento] = {
                id_evento: req.id_evento,
                nombre_evento: req.nombre_evento,
                fecha_evento: req.fecha_evento,
                nombre_usuario: req.nombre_usuario || "—",
                estado_av: req.estado_av,
                equipos: [],
                total_equipos: 0
              };
            }
            acc[req.id_evento].equipos.push({
              id_servicio: req.id_servicio,
              equipo: req.equipo,
              cantidad: req.cantidad,
              ubicacion: req.ubicacion,
              observaciones: req.observaciones,
              estado_av: req.estado_av
            });
            acc[req.id_evento].total_equipos += 1;
            if (req.estado_av === "Pendiente") acc[req.id_evento].estado_av = "Pendiente";
            return acc;
          }, {}));
          setSolicitudesAV(agrupadas);
        } else {
          setSolicitudesAV([]);
        }
      })
      .catch((err) => console.error("Error cargando solicitudes audiovisuales:", err));
  };

  const handleCambiarEstado = async (id_evento, nuevoEstado) => {
    try {
      const res = await fetch(`${API}/audiovisual/evento/${id_evento}/estado`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${usuario?.token || ""}`, "x-usuario-id": usuario?.id_usuario || ""
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        toast.success(`Estado actualizado a ${nuevoEstado}`);
        cargarSolicitudesAV();
      } else {
        toast.error("Error al cambiar el estado.");
      }
    } catch {
      toast.error("No se pudo conectar al servidor.");
    }
  };

  const openModal = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalPages = Math.ceil(solicitudesAV.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = solicitudesAV.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Gestión de Solicitudes Audiovisuales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-bg-subtle border-b border-border-soft text-left">
                <th className="p-3 font-semibold text-text-secondary text-sm">ID EVENTO</th>
                <th className="p-3 font-semibold text-text-secondary text-sm">EVENTO</th>
                <th className="p-3 font-semibold text-text-secondary text-sm">SOLICITANTE</th>
                <th className="p-3 font-semibold text-text-secondary text-sm">CANT. EQ.</th>
                <th className="p-3 font-semibold text-text-secondary text-sm">ESTADO</th>
                <th className="p-3 font-semibold text-text-secondary text-sm">DETALLES</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((av) => (
                <tr key={av.id_evento} className="border-b border-border-soft hover:bg-bg-hover transition-colors">
                  <td className="p-3 text-sm text-text-main font-medium">#EVT-{av.id_evento}</td>
                  <td className="p-3 text-sm text-text-main">{av.nombre_evento}</td>
                  <td className="p-3 text-sm text-text-main">{av.nombre_usuario}</td>
                  <td className="p-3 text-sm text-text-main">{av.total_equipos} equipo(s)</td>
                  <td className="p-3">
                    <select
                      value={av.estado_av || "Pendiente"}
                      onChange={(e) => handleCambiarEstado(av.id_evento, e.target.value)}
                      className="input-base w-auto py-1.5 px-3 text-sm"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Rechazado">Rechazado</option>
                      <option value="Completado">Completado</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button className="btn btn-ghost btn-sm" onClick={() => openModal(av)}>
                      <FiEye /> Ver
                    </button>
                  </td>
                </tr>
              ))}
              {solicitudesAV.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-text-muted">
                    No hay solicitudes registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {solicitudesAV.length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-soft">
            <div className="text-sm text-text-muted">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, solicitudesAV.length)} de {solicitudesAV.length} solicitudes
            </div>
            <div className="flex gap-2 items-center">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="text-sm font-medium">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLES AUDIOVISUAL */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal} style={{zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="card w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()} style={{maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
            <div className="p-5 border-b border-border-soft flex justify-between items-center">
              <h2 className="text-lg font-bold">Detalles de Solicitud Audiovisual</h2>
              <button onClick={closeModal} className="text-text-muted hover:text-text-main font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Evento Relacionado</label>
                  <p className="font-medium">#EVT-{selectedRequest.id_evento} - {selectedRequest.nombre_evento}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Solicitante</label>
                  <p className="font-medium">{selectedRequest.nombre_usuario || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Fecha del Evento</label>
                  <p className="font-medium">{formatFecha(selectedRequest.fecha_evento)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Estado General</label>
                  <p className="font-medium">
                    <span className={`status-pill ${selectedRequest.estado_av === 'Pendiente' ? 'status-pending' : selectedRequest.estado_av === 'Aprobado' ? 'status-approved' : selectedRequest.estado_av === 'Rechazado' ? 'status-rejected' : 'status-info'}`}>
                      {selectedRequest.estado_av}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold mb-3">Equipos Solicitados</h4>
                <div className="border border-border-soft rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-border-soft">
                    <thead className="bg-bg-subtle">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Equipo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Cant.</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Ubicación</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft bg-white">
                      {selectedRequest.equipos && selectedRequest.equipos.map(eq => (
                        <tr key={eq.id_servicio}>
                          <td className="px-4 py-3 text-sm font-medium">{eq.equipo}</td>
                          <td className="px-4 py-3 text-sm">{eq.cantidad}</td>
                          <td className="px-4 py-3 text-sm">{eq.ubicacion || "N/D"}</td>
                          <td className="px-4 py-3 text-sm text-text-muted italic">{eq.observaciones || "Ninguna"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border-soft flex justify-end bg-bg-subtle rounded-b-xl">
              <button className="btn btn-secondary" onClick={closeModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
