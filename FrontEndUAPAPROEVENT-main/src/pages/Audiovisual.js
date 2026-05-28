// src/pages/Audiovisual.js
import React, { useState, useEffect } from "react";
import "./../css/tailwind.css"; // Tailwind base
import { FiAlertTriangle, FiCheckCircle, FiMonitor, FiCamera, FiMic, FiSpeaker, FiVideo, FiEye } from "react-icons/fi";

const API = "http://localhost:8080";

export default function Audiovisual({ usuario }) {
  // Data state
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState({});
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [errorDate, setErrorDate] = useState(null);

  // Admin view state
  const [solicitudesAV, setSolicitudesAV] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state (simple inline details) – omitted for brevity

  // Load initial data
  useEffect(() => {
    fetch(`${API}/eventos`).then(r => r.json()).then(d => setEventos(Array.isArray(d) ? d : []));
    fetch(`${API}/equipos-audiovisuales`).then(r => r.json()).then(d => setEquiposDisponibles(Array.isArray(d) ? d : []));
    if (usuario?.rol === "Administrador" || usuario?.rol === "Audiovisual") {
      cargarSolicitudesAV();
    }
  }, [usuario]);

  const cargarSolicitudesAV = () => {
    fetch(`${API}/audiovisual`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const agrupadas = Object.values(
          data.reduce((acc, req) => {
            if (!acc[req.id_evento]) {
              acc[req.id_evento] = {
                id_evento: req.id_evento,
                nombre_evento: req.nombre_evento,
                fecha_evento: req.fecha_evento,
                nombre_usuario: req.nombre_usuario || "—",
                estado_av: req.estado_av,
                equipos: [],
                total_equipos: 0,
              };
            }
            acc[req.id_evento].equipos.push({
              id_servicio: req.id_servicio,
              equipo: req.equipo,
              cantidad: req.cantidad,
              ubicacion: req.ubicacion,
              observaciones: req.observaciones,
              estado_av: req.estado_av,
            });
            acc[req.id_evento].total_equipos += 1;
            if (req.estado_av === "Pendiente") acc[req.id_evento].estado_av = "Pendiente";
            return acc;
          }, {})
        );
        setSolicitudesAV(agrupadas);
      } else {
        setSolicitudesAV([]);
      }
    }).catch(err => console.error(err));
  };

  const handleCambiarEstado = async (id_evento, nuevoEstado) => {
    try {
      const res = await fetch(`${API}/audiovisual/evento/${id_evento}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario?.token || ""}`,
          "x-usuario-id": usuario?.id_usuario || "",
        },
        body: JSON.stringify({ estado_av: nuevoEstado }),
      });
      if (res.ok) {
        setMensaje({ tipo: "success", texto: `Estado actualizado a ${nuevoEstado}.` });
        cargarSolicitudesAV();
      } else {
        const body = await res.json();
        setMensaje({ tipo: "error", texto: body.mensaje || "Error al cambiar estado." });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar al servidor." });
    }
  };

  const openModal = (av) => {
    alert(`Detalles del evento: ${av.nombre_evento}\nEquipos solicitados: ${av.equipos.map(e => e.equipo + ' (' + e.cantidad + ')').join(', ')}`);
  };

  const handleSelectEvent = e => {
    const evId = e.target.value;
    if (!evId) {
      setEventoSeleccionado(null);
      setErrorDate(null);
      return;
    }
    const ev = eventos.find(item => item.id_evento === Number(evId));
    setEventoSeleccionado(ev);
    setMensaje("");
    // Validate 5‑day rule
    if (ev) {
      const fechaEv = new Date(ev.fecha_evento || ev.fecha_inicio);
      const hoy = new Date();
      fechaEv.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);
      const diff = Math.ceil((fechaEv - hoy) / (1000 * 3600 * 24));
      if (diff < 5) {
        setErrorDate(`Políticas institucionales: solicitud mínima 5 días. Evento en ${diff} día(s).`);
      } else {
        setErrorDate(null);
      }
    }
  };

  const toggleEquipo = id => {
    setEquiposSeleccionados(prev => {
      const isSel = !!prev[id];
      if (isSel) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { cantidad: 1, ubicacion: "" } };
    });
  };

  const changeEquipo = (id, field, value) => {
    setEquiposSeleccionados(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (errorDate) return;
    const seleccionados = Object.keys(equiposSeleccionados);
    if (!eventoSeleccionado || seleccionados.length === 0) {
      setMensaje({ tipo: "error", texto: "Seleccione evento y al menos un equipo." });
      return;
    }
    setLoading(true);
    setMensaje("");
    const servicios = seleccionados.map(key => {
      const meta = equiposDisponibles.find(eq => eq.id_equipo === Number(key));
      const sel = equiposSeleccionados[key];
      return {
        equipo: meta ? meta.nombre : "Desconocido",
        cantidad: sel.cantidad,
        ubicacion: sel.ubicacion,
        observaciones: observacionesGenerales,
      };
    });
    try {
      const res = await fetch(`${API}/audiovisual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario?.token || ""}`,
          "x-usuario-id": usuario?.id_usuario || "",
        },
        body: JSON.stringify({ id_evento: eventoSeleccionado.id_evento, servicios }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMensaje({ tipo: "error", texto: body.mensaje || "Error al enviar solicitud." });
      } else {
        setMensaje({ tipo: "success", texto: "Solicitud enviada con éxito." });
        // Reset form
        setEventoSeleccionado(null);
        setEquiposSeleccionados({});
        setObservacionesGenerales("");
        setErrorDate(null);
        document.getElementById("evento-select").value = "";
        if (usuario?.rol === "Administrador" || usuario?.rol === "Audiovisual") cargarSolicitudesAV();
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar al servidor." });
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(solicitudesAV.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = solicitudesAV.slice(indexOfFirst, indexOfLast);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primaryDark text-white rounded-xl p-6 flex items-center gap-4 shadow-lg">
        <FiMonitor className="text-3xl" />
        <div>
          <h1 className="text-2xl font-extrabold">Solicitud de Servicio Audiovisual</h1>
          <p className="text-sm opacity-90">Registre requerimientos técnicos. Mínimo 5 días de antelación.</p>
        </div>
      </div>

      {/* Message */}
      {mensaje && (
        <div className={`flex items-center p-4 rounded-md ${mensaje.tipo === "error" ? "bg-danger-bg text-danger" : "bg-success-bg text-success"}`}>
          {mensaje.tipo === "error" ? <FiAlertTriangle className="mr-2" /> : <FiCheckCircle className="mr-2" />}
          {mensaje.texto}
        </div>
      )}

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Event selector */}
        <div>
          <label htmlFor="evento-select" className="block text-sm font-medium text-text-secondary mb-1">
            Seleccione el Evento Asociado
          </label>
          <select id="evento-select" className="input-base" onChange={handleSelectEvent} defaultValue="">
            <option value="" disabled>-- Seleccione un evento --</option>
            {eventos.map(ev => (
              <option key={ev.id_evento} value={ev.id_evento}>
                #{ev.id_evento} - {ev.nombre_evento || ev.nombre} ({(ev.fecha_evento || ev.fecha_inicio)?.substring(0, 10)})
              </option>
            ))}
          </select>
          {errorDate && <p className="mt-2 text-sm text-danger">{errorDate}</p>}
        </div>

        {/* Event details card */}
        {eventoSeleccionado && (
          <div className="card p-4 grid grid-cols-2 gap-2">
            <div><strong>Modalidad:</strong> {eventoSeleccionado.modalidad || "—"}</div>
            <div><strong>Fecha:</strong> {eventoSeleccionado.fecha_evento?.substring(0, 10) || "—"}</div>
            <div><strong>Recinto:</strong> {eventoSeleccionado.recinto || "—"}</div>
            <div><strong>Asistentes:</strong> {eventoSeleccionado.asistentes || "—"}</div>
          </div>
        )}

        {/* Equipment selection */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Equipos Audiovisuales</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {equiposDisponibles.map(eq => {
              const selected = !!equiposSeleccionados[eq.id_equipo];
              const IconComp = eq.icono ? require('react-icons/fi')[eq.icono] : FiMonitor;
              return (
                <div key={eq.id_equipo} className={`card p-4 hover-lift cursor-pointer ${selected ? "border-2 border-primary" : ""}`} onClick={() => toggleEquipo(eq.id_equipo)}>
                  <div className="flex flex-col items-center">
                    {eq.tipo === "cámara" && <FiCamera className="text-4xl text-primary mb-2" />}
                    {eq.tipo === "micrófono" && <FiMic className="text-4xl text-primary mb-2" />}
                    {eq.tipo === "speaker" && <FiSpeaker className="text-4xl text-primary mb-2" />}
                    {eq.tipo === "video" && <FiVideo className="text-4xl text-primary mb-2" />}
                    <h3 className="font-medium text-text-main">{eq.nombre}</h3>
                  </div>
                  {selected && (
                    <div className="mt-3 space-y-2 w-full" onClick={e => e.stopPropagation()}>
                      <input type="number" min="1" className="input-base" placeholder="Cantidad" value={equiposSeleccionados[eq.id_equipo].cantidad} onChange={e => changeEquipo(eq.id_equipo, "cantidad", e.target.value)} />
                      <input type="text" className="input-base" placeholder="Ubicación" value={equiposSeleccionados[eq.id_equipo].ubicacion} onChange={e => changeEquipo(eq.id_equipo, "ubicacion", e.target.value)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-text-secondary mb-1">
            Observaciones Técnicas
          </label>
          <textarea id="observaciones" className="input-base h-32" placeholder="Notas especiales..." value={observacionesGenerales} onChange={e => setObservacionesGenerales(e.target.value)} />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </form>

      {/* Admin table */}
      {(usuario?.rol === "Administrador" || usuario?.rol === "Audiovisual") && (
        <div className="card p-4 space-y-4">
          <h4 className="text-lg font-semibold">Gestión de Solicitudes</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-bg-subtle">
                  <th className="p-2 text-left">ID Evento</th>
                  <th className="p-2 text-left">Evento</th>
                  <th className="p-2 text-left">Solicitante</th>
                  <th className="p-2 text-left">Equipos</th>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(av => (
                  <tr key={av.id_evento} className="border-t border-border-soft">
                    <td className="p-2">#EVT-{av.id_evento}</td>
                    <td className="p-2">{av.nombre_evento}</td>
                    <td className="p-2">{av.nombre_usuario}</td>
                    <td className="p-2">{av.total_equipos} eq.</td>
                    <td className="p-2">
                      <select value={av.estado_av || "Pendiente"} onChange={e => handleCambiarEstado(av.id_evento, e.target.value)} className="input-base w-auto">
                        <option value="Pendiente">Pendiente</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Rechazado">Rechazado</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button className="btn btn-ghost" onClick={() => openModal(av)}><FiEye /> Ver</button>
                    </td>
                  </tr>
                ))}
                {solicitudesAV.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-text-muted">No hay solicitudes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {solicitudesAV.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <span>Mostrando {indexOfFirst + 1}‑{Math.min(indexOfLast, solicitudesAV.length)} de {solicitudesAV.length}</span>
              <div className="space-x-2">
                <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
                <span>Página {currentPage} de {totalPages}</span>
                <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
