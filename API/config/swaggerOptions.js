const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Dokumentation',
            version: '1.0.0',
            description: 'Dokumentation für die API',
        },
    },
    apis: ['./routes/*.js'], // Pfad zu den Routen
};

const swaggerSpec = swaggerJsDoc(options);

const swaggerUiOptions = {
    explorer: true,
    docExpansion: "none",
    defaultModelsExpandDepth: -1 // Verhindert das automatische Aufklappen von Models
};


module.exports = { swaggerUi, swaggerSpec, swaggerUiOptions };