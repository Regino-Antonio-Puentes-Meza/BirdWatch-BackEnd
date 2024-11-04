module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current', // Esto asegura que Babel transpile el código para la versión actual de Node.js
                },
                modules: 'auto', // Permite que Babel decida si debe usar módulos ES o CommonJS
            },
        ],
        '@babel/preset-react', // Debe estar en un array separado
    ],
};
