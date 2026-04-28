const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const categories = ['naturaleza', 'retratos', 'nocturnas', 'urbanas', 'atardeceres', 'amaneceres', 'macro'];

const result = {};

categories.forEach(category => {
    const categoryPath = path.join(imagesDir, category);
    if (!fs.existsSync(categoryPath)) return;
    
    const files = fs.readdirSync(categoryPath)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map(file => ({
            file: file,
            title: file.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
            description: "",
            category: category
        }));
    
    result[category] = files;
});

fs.writeFileSync(
    path.join(__dirname, 'images.json'),
    JSON.stringify(result, null, 2)
);

console.log('images.json generado correctamente');
console.log('Total imágenes:', Object.values(result).reduce((a, b) => a + b.length, 0));
