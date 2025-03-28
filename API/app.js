const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./config/swaggerOptions');


const kategorieRoutes = require('./routes/kategorieRoutes');
const bereichRoutes = require('./routes/bereichRoutes'); // Bereich Routen
const herstellerRoutes = require('./routes/herstellerRoutes'); // Hersteller Routen
const dokumenteRoutes = require('./routes/dokumenteRoutes') // Dokumente Routen
const modelRoutes = require('./routes/modellRoutes') // Modell Routen
const objekttypRoutes = require('./routes/objekttypRoutes') // objekttyp Routen
const personRoutes = require('./routes/personRoutes');
const standortRoutes = require('./routes/standortRoutes');
const statusRoutes = require('./routes/statusRoutes');
const geraeteRoutes = require('./routes/geraetRoutes')

const app = express();
app.use(cors());
app.use(bodyParser.json());


// Swagger-Dokumentation über eine Route verfügbar machen
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Routen registrieren
app.use('/api/kategorie', kategorieRoutes); // Kategorie Routen
app.use('/api/bereich', bereichRoutes); // Bereich Routen
app.use('/api/hersteller', herstellerRoutes); // Hersteller Routen
app.use('/api/dokumente', dokumenteRoutes); // Dokumente Routen
app.use('/api/modell', modelRoutes); // Modell Routen
app.use('/api/objekttyp',objekttypRoutes); // Objekttyp Routen
app.use('/api/person',personRoutes);
app.use('/api/standort', standortRoutes);
app.use('/api/status', statusRoutes);
app.use ('/api/geraet',geraeteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
