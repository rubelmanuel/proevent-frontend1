const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'uapa_proevent',
  port: 3307
});

db.connect(async (err) => {
  if (err) {
    console.error('Error conectando a la BD:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos.');

  // 1. Verificar si existe la columna tipo_servicio
  db.query("SHOW COLUMNS FROM servicio_audiovisual LIKE 'tipo_servicio'", (err, cols) => {
    if (err) {
      console.error('Error al verificar columnas:', err);
      db.end();
      process.exit(1);
    }

    if (cols.length > 0) {
      console.log('✅ La columna tipo_servicio ya existe en servicio_audiovisual.');
      db.end();
      process.exit(0);
    } else {
      console.log('⚠️ La columna tipo_servicio NO existe. Procediendo a agregarla...');

      // Agregar columna tipo_servicio
      db.query("ALTER TABLE servicio_audiovisual ADD COLUMN tipo_servicio VARCHAR(150) NULL AFTER id_evento", (errAlter) => {
        if (errAlter) {
          console.error('Error al agregar columna tipo_servicio:', errAlter);
          db.end();
          process.exit(1);
        }
        console.log('✅ Columna tipo_servicio agregada con éxito.');

        // Rellenar tipo_servicio basado en id_equipo para mantener consistencia histórica
        const updateQuery = `
          UPDATE servicio_audiovisual sa
          LEFT JOIN equipo_audiovisual ea ON sa.id_equipo = ea.id_equipo
          SET sa.tipo_servicio = COALESCE(ea.nombre, 'Equipamiento Audiovisual')
          WHERE sa.tipo_servicio IS NULL
        `;

        db.query(updateQuery, (errUpdate) => {
          if (errUpdate) {
            console.error('Error al actualizar datos históricos:', errUpdate);
          } else {
            console.log('✅ Datos históricos actualizados correctamente en tipo_servicio.');
          }

          // Hacer que tipo_servicio sea NOT NULL
          db.query("ALTER TABLE servicio_audiovisual MODIFY COLUMN tipo_servicio VARCHAR(150) NOT NULL", (errModify) => {
            if (errModify) {
              console.error('Error al hacer tipo_servicio NOT NULL:', errModify);
            } else {
              console.log('✅ Columna tipo_servicio configurada como NOT NULL.');
            }
            db.end();
            process.exit(0);
          });
        });
      });
    }
  });
});
