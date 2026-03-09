import React from "react";

export default function ServiciosyDetalles({ data, setData }) {
  const toggleItem = (item, listName) => {
    const list = data[listName] || [];
    if (list.includes(item)) {
      setData({ ...data, [listName]: list.filter(i => i !== item) });
    } else {
      setData({ ...data, [listName]: [...list, item] });
    }
  };

  // Opciones de detalles corporativos
  const detallesCorporativos = [
    "Bultos, T-shert",
    "Editoriales UAPA (libros)",
    "Lapiceros",
    "Llaveros",
    "Vasos",
    "Libreta",
    "Otros",
    "No aplica"
  ];

  // Opciones de alimentos y bebidas
  const alimentosBebidas = [
    "Desayuno",
    "Coffee break o aperitivo",
    "Buffet-Almuerzo",
    "Refrigerio",
    "No aplica"
  ];

  return (
    <section>
      <h3>Servicios alimenticios y Detalles corporativos</h3>

      {/* Lista de detalles corporativos */}
      <div className="checklist">
        <h4>Tipos de detalles corporativos</h4>
        {detallesCorporativos.map((item) => (
          <label key={item} className="check-item">
            <input
              type="checkbox"
              checked={data.items?.includes(item) || false}
              onChange={() => toggleItem(item, "items")}
            />
            {item}
          </label>
        ))}
      </div>

      {/* Lista de alimentos y bebidas */}
      <div className="checklist">
        <h4>Alimentos y bebidas</h4>
        {alimentosBebidas.map((item) => (
          <label key={item} className="check-item">
            <input
              type="checkbox"
              checked={data.catering?.includes(item) || false}
              onChange={() => toggleItem(item, "catering")}
            />
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}
