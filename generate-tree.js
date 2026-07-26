// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Carpetas que no aportan valor arquitectónico
const ignoreList = [
    'node_modules', 'bin', 'obj', '.git', '.angular', 
    '.expo', '.vs', 'dist', 'build', 'ios', 'android'
];

function buildTree(dir, prefix = '', depth = 0, maxDepth = 6) {
    if (depth > maxDepth) return '';
    let result = '';
    let items = [];
    
    try {
        items = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return '';
    }

    const filteredItems = items.filter(item => !ignoreList.includes(item.name));

    filteredItems.forEach((item, index) => {
        const isLast = index === filteredItems.length - 1;
        const pointer = isLast ? '+-- ' : '|-- ';
        result += `${prefix}${pointer}${item.name}\n`;

        if (item.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '|   ');
            result += buildTree(path.join(dir, item.name), newPrefix, depth + 1, maxDepth);
        }
    });
    
    return result;
}

// Nodos críticos de la arquitectura
const targets = ['src'];

console.log('Iniciando mapeo de arquitectura...');

targets.forEach(target => {
    const targetPath = path.join(__dirname, target);
    if (fs.existsSync(targetPath)) {
        const treeStructure = `${target}\n${buildTree(targetPath)}`;
        const outputFileName = `estructura_${target.toLowerCase()}.txt`;
        
        // Escritura directa al disco en UTF-8, evitando la terminal de Windows
        fs.writeFileSync(outputFileName, treeStructure, 'utf8');
        console.log(`[EXITO] Generado: ${outputFileName}`);
    } else {
        console.log(`[OMITIDO] No se encontro la carpeta: ${target}`);
    }
});