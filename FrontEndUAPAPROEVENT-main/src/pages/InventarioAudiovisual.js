import React, { useState, useEffect } from "react";
import { FiBox, FiSearch, FiInfo, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const API = "http://localhost:8080";

function InventarioAudiovisual({ usuario }) {
  const [equipos, setEquipos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resEquipos, resSolicitudes] = await Promise.all([
        fetch(`${API}/equipos-audiovisuales`),
        fetch(`${API}/audiovisual`)
      ]);
      const dataEquipos = await resEquipos.json();
      const dataSolicitudes = await resSolicitudes.json();
      
      setEquipos(Array.isArray(dataEquipos) ? dataEquipos : []);
      // Normalizar datos de solicitudes basados en el servidor
      const solicitudesFormateadas = Array.isArray(dataSolicitudes) ? dataSolicitudes.map(row => ({
        id_servicio: row.id_servicio,
        id_evento: row.id_evento,
        estado_av: row.estado_av,
        cantidad: row.cantidad || 1,
        ubicacion: row.ubicacion || '',
        observaciones: row.observaciones || '',
        nombre_evento: row.nombre_evento,
        fecha_evento: row.fecha_inicio,
        recinto: row.recinto,
        nombre_usuario: row.nombre_usuario || "—",
        equipo: row.equipo // Map de backend a variable
      })) : [];
      setSolicitudes(solicitudesFormateadas);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular inventario
  const inventario = equipos.map(eq => {
    // Solo contar solicitudes activas que retienen equipo
    const solicitudesActivas = solicitudes.filter(req => 
      req.equipo === eq.nombre && 
      ['Pendiente', 'En revisión', 'Aprobado'].includes(req.estado_av)
    );
    const enUso = solicitudesActivas.reduce((sum, req) => sum + req.cantidad, 0);
    const total = eq.cantidad_total || 0;
    const disponible = total - enUso;

    return {
      ...eq,
      total,
      enUso,
      disponible,
      solicitudesActivas
    };
  });

  const filteredInventario = inventario.filter(eq =>
    eq.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "N/D";
    const date = new Date(fechaStr);
    return date.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  const openModal = (equipo) => {
    setSelectedEquipo(equipo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEquipo(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-main">Inventario en Tiempo Real</h2>
          <p className="text-sm text-text-secondary mt-1">Supervisa la disponibilidad de los equipos y las solicitudes que los retienen.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              type="text"
              className="input-base pl-10"
              placeholder="Buscar dispositivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary whitespace-nowrap" onClick={cargarDatos}>Actualizar</button>
        </div>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="flex justify-center py-12 text-text-muted">
            Cargando inventario...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-soft bg-bg-subtle">
                  <th className="py-3 px-4 text-xs font-bold text-text-muted uppercase">DISPOSITIVO</th>
                  <th className="py-3 px-4 text-xs font-bold text-text-muted uppercase text-center">TOTAL INVENTARIO</th>
                  <th className="py-3 px-4 text-xs font-bold text-text-muted uppercase text-center">EN USO / RESERVADO</th>
                  <th className="py-3 px-4 text-xs font-bold text-text-muted uppercase text-center">DISPONIBLE</th>
                  <th className="py-3 px-4 text-xs font-bold text-text-muted uppercase text-center">ESTADO</th>
                  <th className="py-3 px-4 text-xs font-bold text-text-muted uppercase text-right">DETALLES DE USO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredInventario.map((eq) => (
                  <tr key={eq.id_equipo} className="hover:bg-bg-subtle transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-subtle flex items-center justify-center text-text-muted border border-border-soft">
                          <FiBox className="text-lg" />
                        </div>
                        <strong className="text-sm text-text-main">{eq.nombre}</strong>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-sm text-text-main">{eq.total}</td>
                    <td className={`py-4 px-4 text-center font-bold text-sm ${eq.enUso > 0 ? 'text-danger' : 'text-text-muted'}`}>
                      {eq.enUso}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        eq.disponible > 0 ? 'bg-success-bg text-success border border-success-border' : 'bg-danger-bg text-danger border border-danger-border'
                      }`}>
                        {eq.disponible}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {eq.disponible > 0 ? (
                        <span className="flex items-center justify-center gap-1 text-xs font-bold text-success"><FiCheckCircle /> Disponible</span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-xs font-bold text-danger"><FiAlertCircle /> Agotado</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => openModal(eq)}
                        disabled={eq.enUso === 0}
                      >
                        <FiInfo /> Ver Solicitudes
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInventario.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-sm text-text-muted">
                      No se encontraron dispositivos en el catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedEquipo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 animate-fade" onClick={closeModal}>
          <div className="bg-bg-card rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border-soft flex justify-between items-center bg-bg-subtle">
              <h2 className="text-lg font-bold text-text-main">Detalles de Uso: {selectedEquipo.nombre}</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-bg-subtle p-4 rounded-xl text-center border border-border-soft">
                  <div className="text-2xl font-black text-text-main">{selectedEquipo.total}</div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Inventario</div>
                </div>
                <div className="bg-danger-bg p-4 rounded-xl text-center border border-danger-border">
                  <div className="text-2xl font-black text-danger">{selectedEquipo.enUso}</div>
                  <div className="text-xs font-semibold text-danger uppercase tracking-wider">En Uso / Reservado</div>
                </div>
                <div className="bg-success-bg p-4 rounded-xl text-center border border-success-border">
                  <div className="text-2xl font-black text-success">{selectedEquipo.disponible}</div>
                  <div className="text-xs font-semibold text-success uppercase tracking-wider">Disponibles</div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-text-main mb-3 uppercase text-text-muted tracking-wider">Eventos Solicitando este Dispositivo</h4>
              
              <div className="max-h-[300px] overflow-y-auto border border-border-soft rounded-lg">
                <table className="min-w-full text-left text-sm border-collapse">
                  <thead className="bg-bg-subtle sticky top-0 z-10 shadow-sm border-b border-border-soft">
                    <tr>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase">ID Evento</th>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase">Evento</th>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase">Solicitante</th>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase">Fecha</th>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase">Ubicación</th>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase text-center">Cant.</th>
                      <th className="p-3 font-bold text-text-muted text-xs uppercase text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {selectedEquipo.solicitudesActivas.map(req => (
                      <tr key={req.id_servicio} className="hover:bg-bg-subtle">
                        <td className="p-3 font-medium text-text-muted">#EVT-{req.id_evento}</td>
                        <td className="p-3 font-semibold text-text-main">{req.nombre_evento}</td>
                        <td className="p-3 text-text-secondary">{req.nombre_usuario}</td>
                        <td className="p-3 text-text-secondary">{formatFecha(req.fecha_evento)}</td>
                        <td className="p-3 text-text-secondary">{req.ubicacion || "N/A"}</td>
                        <td className="p-3 text-center font-bold text-danger">{req.cantidad}</td>
                        <td className="p-3 text-center">
                          <span className={`status-pill ${
                            req.estado_av === "Aprobado" ? "status-approved" : 
                            req.estado_av === "En revisión" ? "status-pending" : "status-info"
                          }`}>
                            {req.estado_av}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {selectedEquipo.solicitudesActivas.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center p-6 text-text-muted text-sm">Ocurrió un error (lista vacía).</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border-soft bg-bg-subtle flex justify-end">
              <button className="btn btn-secondary" onClick={closeModal}>Cerrar Detalles</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventarioAudiovisual;
