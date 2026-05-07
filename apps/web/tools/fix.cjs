const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.jsx') || file.endsWith('.js')) results.push(file);
    });
    return results;
}
walk('c:/Users/saivi/Downloads/nss option 4/apps/web/src').forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    content = content.replace(/,\s*\{\s*\$autoCancel:\s*false\s*\}/g, '');
    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log('Fixed', f);
    }
});
