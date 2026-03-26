const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'ChurchINV API',
            version: '1.2.0',
            description: 'OpenAPI-Dokumentation fuer die ChurchINV-API.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Lokale Entwicklung',
            },
        ],
        tags: [
            { name: 'Geraet', description: 'Geraeteverwaltung, Upload und Verlauf' },
            { name: 'Buchung', description: 'Mehrgeraete-Buchungen mit Zeitraum' },
            { name: 'PCO', description: 'Planning-Center-Mappings fuer Service Types und Standard-Geraete' },
            { name: 'Dokumente', description: 'Dokument-Upload und Geraete-Dokumente' },
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
                    description: 'Erforderlich fuer Admin-Endpunkte wie POST, PUT und DELETE.',
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
                        message: { type: 'string', example: 'Eintrag erfolgreich geloescht' },
                    },
                },
                BookingDevice: {
                    type: 'object',
                    properties: {
                        inv_nr: { type: 'integer', example: 12 },
                        modell: { type: 'string', example: 'PXW-FS5' },
                        hersteller: { type: 'string', nullable: true, example: 'Sony' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 4 },
                        titel: { type: 'string', example: 'Jugendabend Technik' },
                        bucher_name: { type: 'string', example: 'Cedric Betke' },
                        zweck: { type: 'string', nullable: true, example: 'Beschallung und Bild fuer den Abend' },
                        start_datum: { type: 'string', format: 'date-time', example: '2026-03-27T17:00:00.000Z' },
                        end_datum: { type: 'string', format: 'date-time', example: '2026-03-27T22:00:00.000Z' },
                        status: { type: 'string', example: 'reserviert' },
                        erstellt_am: { type: 'string', format: 'date-time' },
                        geraete: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/BookingDevice' },
                        },
                    },
                },
                BookingWritePayload: {
                    type: 'object',
                    required: ['titel', 'bucher_name', 'start_datum', 'end_datum', 'geraete_inv_nr'],
                    properties: {
                        titel: { type: 'string', example: 'Jugendabend Technik' },
                        bucher_name: { type: 'string', example: 'Cedric Betke' },
                        zweck: { type: 'string', nullable: true, example: 'Beschallung und Bild fuer den Abend' },
                        start_datum: { type: 'string', format: 'date-time', example: '2026-03-27T17:00:00.000Z' },
                        end_datum: { type: 'string', format: 'date-time', example: '2026-03-27T22:00:00.000Z' },
                        geraete_inv_nr: {
                            type: 'array',
                            items: { type: 'integer' },
                            example: [12, 13, 18],
                        },
                    },
                },
                PcoServiceTypeMappingDevice: {
                    type: 'object',
                    properties: {
                        inv_nr: { type: 'integer', example: 12 },
                        modell: { type: 'string', nullable: true, example: 'PXW-FS5' },
                        hersteller: { type: 'string', nullable: true, example: 'Sony' },
                        bereich: { type: 'string', nullable: true, example: 'Medientechnik' },
                        standort: { type: 'string', nullable: true, example: 'Studio' },
                    },
                },
                PcoServiceTypeMapping: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        pco_service_type_id: { type: 'string', example: '227874' },
                        pco_service_type_name: { type: 'string', example: '01_Gottesdienst' },
                        is_virtual: { type: 'boolean', example: false },
                        source_service_type_id: { type: 'string', nullable: true, example: '349570' },
                        source_service_type_name: { type: 'string', nullable: true, example: '05_Sonderveranstaltungen' },
                        source_series_title: { type: 'string', nullable: true, example: 'GBK' },
                        aktiv: { type: 'boolean', example: true },
                        erstellt_am: { type: 'string', format: 'date-time' },
                        aktualisiert_am: { type: 'string', format: 'date-time' },
                        geraete: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PcoServiceTypeMappingDevice' },
                        },
                    },
                },
                PcoServiceTypeMappingUpdatePayload: {
                    type: 'object',
                    properties: {
                        aktiv: { type: 'boolean', example: true },
                        geraete_inv_nr: {
                            type: 'array',
                            items: { type: 'integer' },
                            example: [12, 13, 18],
                        },
                    },
                },
                PcoPlanSuggestion: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '83946316' },
                        service_type_id: { type: 'string', example: '227874' },
                        service_type_name: { type: 'string', example: '01_Gottesdienst' },
                        is_virtual: { type: 'boolean', example: false },
                        source_service_type_id: { type: 'string', nullable: true, example: '349570' },
                        source_service_type_name: { type: 'string', nullable: true, example: '05_Sonderveranstaltungen' },
                        source_series_title: { type: 'string', nullable: true, example: 'GBK' },
                        plan_title: { type: 'string', nullable: true, example: 'Karfreitag - Abendmahl' },
                        display_title: { type: 'string', example: 'Karfreitag - Abendmahl' },
                        booking_title: { type: 'string', example: '01_Gottesdienst · Karfreitag - Abendmahl' },
                        dates: { type: 'string', nullable: true, example: '3 April 2026' },
                        short_dates: { type: 'string', nullable: true, example: '3 Apr 2026' },
                        sort_date: { type: 'string', format: 'date-time', example: '2026-04-03T09:00:00.000Z' },
                        suggested_end_datum: { type: 'string', format: 'date-time', nullable: true, example: '2026-04-03T12:00:00.000Z' },
                        planning_center_url: { type: 'string', nullable: true, example: 'https://services.planningcenteronline.com/plans/84457880' },
                        series_title: { type: 'string', nullable: true, example: 'GBK' },
                        series_id: { type: 'string', nullable: true, example: '2491383' },
                        has_mapping: { type: 'boolean', example: true },
                        geraete: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PcoServiceTypeMappingDevice' },
                        },
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
                        Status: { type: 'string', example: 'Verfuegbar' },
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
                        alter_wert: { type: 'string', nullable: true, example: 'Verfuegbar' },
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
