const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'ChurchINV API',
            version: '1.1.0',
            description: 'OpenAPI-Dokumentation für die ChurchINV-API.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Lokale Entwicklung',
            },
        ],
        tags: [
            { name: 'Gerät', description: 'Geräteverwaltung, Upload und Verlauf' },
            { name: 'Dokumente', description: 'Dokument-Upload und Geräte-Dokumente' },
            { name: 'Hersteller', description: 'Pflege der Hersteller-Stammdaten' },
            { name: 'Modell', description: 'Pflege der Modell-Stammdaten' },
            { name: 'Objekttyp', description: 'Pflege der Objekttyp-Stammdaten' },
        ],
        components: {
            securitySchemes: {
                AdminPassword: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-admin-password',
                    description: 'Erforderlich für Admin-Endpunkte wie POST, PUT und DELETE.',
                },
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Fehler beim Speichern' },
                    },
                },
                SuccessMessage: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Eintrag erfolgreich gelöscht' },
                    },
                },
                DeviceListItem: {
                    type: 'object',
                    properties: {
                        inv_nr: { type: 'integer', example: 11 },
                        kaufdatum: { type: 'string', format: 'date', nullable: true },
                        einkaufspreis: { type: 'number', format: 'float', nullable: true, example: 249.99 },
                        zustandshinweis: { type: 'string', nullable: true, example: 'Leichte Gebrauchsspuren am Gehaeuse' },
                        geraetefoto_url: { type: 'string', nullable: true, example: '/uploads/geraete/171234_test.png' },
                        Status: { type: 'string', example: 'Verfügbar' },
                        Hersteller: { type: 'string', example: 'Sony' },
                        Objekttyp: { type: 'string', example: 'Videokamera' },
                        Modell: { type: 'string', example: 'PXW-FS5' },
                        Standort: { type: 'string', nullable: true, example: 'Studio' },
                        Bereich: { type: 'string', example: 'Medientechnik' },
                        Kategorie: { type: 'string', nullable: true, example: 'Video' },
                        Verantwortlicher: { type: 'string', nullable: true, example: 'Cedric Betke' },
                    },
                },
                DeviceDetail: {
                    type: 'object',
                    properties: {
                        inv_nr: { type: 'integer', example: 11 },
                        status_id: { type: 'integer', example: 1 },
                        modell_id: { type: 'integer', example: 3 },
                        bereich_id: { type: 'integer', example: 2 },
                        kaufdatum: { type: 'string', format: 'date', nullable: true },
                        einkaufspreis: { type: 'number', format: 'float', nullable: true },
                        zustandshinweis: { type: 'string', nullable: true, example: 'Leichte Gebrauchsspuren am Gehaeuse' },
                        serien_nr: { type: 'string', nullable: true, example: 'ABC-123' },
                        standort_id: { type: 'integer', nullable: true, example: 4 },
                        verantwortlicher_id: { type: 'integer', nullable: true, example: 9 },
                        kategorie_id: { type: 'integer', nullable: true, example: 2 },
                        geraetefoto_url: { type: 'string', nullable: true, example: '/uploads/geraete/171234_test.png' },
                    },
                },
                DeviceWritePayload: {
                    type: 'object',
                    required: ['inv_nr', 'modell_id', 'status_id', 'bereich_id'],
                    properties: {
                        inv_nr: { type: 'integer', example: 11 },
                        modell_id: { type: 'integer', example: 3 },
                        status_id: { type: 'integer', example: 1 },
                        bereich_id: { type: 'integer', example: 2 },
                        standort_id: { type: 'integer', nullable: true, example: 4 },
                        verantwortlicher_id: { type: 'integer', nullable: true, example: 9 },
                        kategorie_id: { type: 'integer', nullable: true, example: 2 },
                        serien_nr: { type: 'string', nullable: true, example: 'ABC-123' },
                        kaufdatum: { type: 'string', format: 'date', nullable: true, example: '2026-03-01' },
                        einkaufspreis: { type: 'number', format: 'float', nullable: true, example: 249.99 },
                        zustandshinweis: { type: 'string', nullable: true, example: 'Leichte Gebrauchsspuren am Gehaeuse' },
                        geraetefoto_url: { type: 'string', nullable: true, example: '/uploads/geraete/171234_test.png' },
                    },
                },
                DeviceUpdatePayload: {
                    type: 'object',
                    required: ['modell_id', 'status_id', 'bereich_id'],
                    properties: {
                        modell_id: { type: 'integer', example: 3 },
                        status_id: { type: 'integer', example: 1 },
                        bereich_id: { type: 'integer', example: 2 },
                        standort_id: { type: 'integer', nullable: true, example: 4 },
                        verantwortlicher_id: { type: 'integer', nullable: true, example: 9 },
                        kategorie_id: { type: 'integer', nullable: true, example: 2 },
                        serien_nr: { type: 'string', nullable: true, example: 'ABC-123' },
                        seriennummer: { type: 'string', nullable: true, deprecated: true, example: 'ABC-123' },
                        kaufdatum: { type: 'string', format: 'date', nullable: true, example: '2026-03-01' },
                        einkaufspreis: { type: 'number', format: 'float', nullable: true, example: 249.99 },
                        zustandshinweis: { type: 'string', nullable: true, example: 'Leichte Gebrauchsspuren am Gehaeuse' },
                        geraetefoto_url: { type: 'string', nullable: true, example: '/uploads/geraete/171234_test.png' },
                    },
                },
                DeviceHistoryEntry: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 5 },
                        geraet_inv_nr: { type: 'integer', example: 11 },
                        aktion: { type: 'string', example: 'update' },
                        feld: { type: 'string', nullable: true, example: 'status' },
                        alter_wert: { type: 'string', nullable: true, example: 'Verfügbar' },
                        neuer_wert: { type: 'string', nullable: true, example: 'Defekt' },
                        erstellt_am: { type: 'string', format: 'date-time' },
                    },
                },
                UploadRequest: {
                    type: 'object',
                    required: ['dataUrl'],
                    properties: {
                        dataUrl: { type: 'string', example: 'data:image/png;base64,iVBORw0...' },
                        fileName: { type: 'string', example: 'geraetefoto.png' },
                    },
                },
                UploadResponse: {
                    type: 'object',
                    properties: {
                        path: { type: 'string', example: '/uploads/geraete/171234_test.png' },
                    },
                },
                Dokument: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 3 },
                        name: { type: 'string', example: 'rechnung.pdf' },
                        url: { type: 'string', example: '/uploads/dokumente/171234_rechnung.pdf' },
                        geraete_id: { type: 'integer', example: 11 },
                        hochgeladen_am: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                DokumentWritePayload: {
                    type: 'object',
                    required: ['name', 'url', 'geraete_id'],
                    properties: {
                        name: { type: 'string', example: 'rechnung.pdf' },
                        url: { type: 'string', example: '/uploads/dokumente/171234_rechnung.pdf' },
                        geraete_id: { type: 'integer', example: 11 },
                    },
                },
                Hersteller: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Sony' },
                    },
                },
                HerstellerWritePayload: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Sony' },
                    },
                },
                Objekttyp: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Videokamera' },
                    },
                },
                ObjekttypWritePayload: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Videokamera' },
                    },
                },
                Modell: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'PXW-FS5' },
                        hersteller_id: { type: 'integer', example: 1 },
                        objekttyp_id: { type: 'integer', example: 2 },
                    },
                },
                ModellWritePayload: {
                    type: 'object',
                    required: ['name', 'hersteller_id', 'objekttyp_id'],
                    properties: {
                        name: { type: 'string', example: 'PXW-FS5' },
                        hersteller_id: { type: 'integer', example: 1 },
                        objekttyp_id: { type: 'integer', example: 2 },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

const swaggerUiOptions = {
    explorer: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: -1,
};

module.exports = { swaggerUi, swaggerSpec, swaggerUiOptions };
