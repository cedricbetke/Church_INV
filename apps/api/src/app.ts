import express from "express";
import cors from "cors";
import path from "path";

// deine bisherigen requires kannst du erstmal so lassen
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require("./config/swaggerOptions");

const kategorieRoutes = require("./routes/kategorieRoutes");
const bereichRoutes = require("./routes/bereichRoutes");
const herstellerRoutes = require("./routes/herstellerRoutes");
const dokumenteRoutes = require("./routes/dokumenteRoutes");
const modellRoutes = require("./routes/modellRoutes");
const objekttypRoutes = require("./routes/objekttypRoutes");
const personRoutes = require("./routes/personRoutes");
const standortRoutes = require("./routes/standortRoutes");
const statusRoutes = require("./routes/statusRoutes");
const geraetRoutes = require("./routes/geraetRoutes");
const buchungRoutes = require("./routes/buchungRoutes");
const pcoMappingRoutes = require("./routes/pcoMappingRoutes");
const pcoPlanSuggestionRoutes = require("./routes/pcoPlanSuggestionRoutes");

export const app = express();
const uploadsDir = path.resolve(__dirname, "..", "uploads");

app.use(cors());
app.use(express.json({ limit: "15mb" })); // body-parser brauchst du dann nicht mehr
app.use("/uploads", express.static(uploadsDir));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use("/api/kategorie", kategorieRoutes);
app.use("/api/bereich", bereichRoutes);
app.use("/api/hersteller", herstellerRoutes);
app.use("/api/dokumente", dokumenteRoutes);
app.use("/api/modell", modellRoutes);
app.use("/api/objekttyp", objekttypRoutes);
app.use("/api/person", personRoutes);
app.use("/api/standort", standortRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/geraet", geraetRoutes);
app.use("/api/buchung", buchungRoutes);
app.use("/api/pco-mapping", pcoMappingRoutes);
app.use("/api/pco-plan-suggestion", pcoPlanSuggestionRoutes);
