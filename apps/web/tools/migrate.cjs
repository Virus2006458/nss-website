const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    let changed = false;

    if (content.includes("import pb from '@/lib/pocketbaseClient'")) {
        content = content.replace("import pb from '@/lib/pocketbaseClient'", "import { supabase } from '@/lib/supabaseClient'");
        changed = true;
    }

    // Replace pb.collection('x').getFullList(...) -> supabase.from('x').select('*')
    // We'll use a regex that matches: pb.collection('x').getFullList({ sort: 'y' })
    const getFullListRegex = /await pb\.collection\(['"`](.*?)['"`]\)\.getFullList\(\{([^}]*)\}\)/g;
    content = content.replace(getFullListRegex, (match, collection, optionsStr) => {
        let orderClause = '';
        if (optionsStr.includes('sort:')) {
            const sortMatch = optionsStr.match(/sort:\s*['"`](.*?)['"`]/);
            if (sortMatch) {
                let sortCol = sortMatch[1];
                let asc = true;
                if (sortCol.startsWith('-')) {
                    sortCol = sortCol.substring(1);
                    asc = false;
                }
                orderClause = `.order('${sortCol}', { ascending: ${asc} })`;
            }
        }
        return `await supabase.from('${collection}').select('*')${orderClause}`;
    });

    const getFullListSimpleRegex = /await pb\.collection\(['"`](.*?)['"`]\)\.getFullList\(\)/g;
    content = content.replace(getFullListSimpleRegex, "await supabase.from('$1').select('*')");

    // Replace pb.collection('x').create(y) -> supabase.from('x').insert([y])
    const createRegex = /await pb\.collection\(['"`](.*?)['"`]\)\.create\((.*?)\)/g;
    content = content.replace(createRegex, "await supabase.from('$1').insert([$2])");

    // Replace pb.collection('x').update(id, y) -> supabase.from('x').update(y).eq('id', id)
    const updateRegex = /await pb\.collection\(['"`](.*?)['"`]\)\.update\((.*?),\s*(.*?)\)/g;
    content = content.replace(updateRegex, "await supabase.from('$1').update($3).eq('id', $2)");

    // Replace pb.collection('x').delete(id) -> supabase.from('x').delete().eq('id', id)
    const deleteRegex = /await pb\.collection\(['"`](.*?)['"`]\)\.delete\((.*?)\)/g;
    content = content.replace(deleteRegex, "await supabase.from('$1').delete().eq('id', $2)");

    // Replace pb.files.getUrl(record, record.photo) -> supabase.storage.from(collection).getPublicUrl(record.photo).data.publicUrl
    const getUrlRegex = /pb\.files\.getUrl\((.*?),\s*(.*?)\.([a-zA-Z0-9_]+)\)/g;
    content = content.replace(getUrlRegex, (match, recordVar, recordVar2, fileField) => {
        return `supabase.storage.from('images').getPublicUrl(${recordVar2}.${fileField}).data.publicUrl`;
    });

    // In EventCard and TeamCard, they might use record.image directly
    const getUrlRegex2 = /pb\.files\.getUrl\((.*?),\s*(.*?)\)/g;
    content = content.replace(getUrlRegex2, "supabase.storage.from('images').getPublicUrl($2).data.publicUrl");

    // Replace variables storing results from `const records = await supabase...`
    // Supabase returns { data, error }. Pocketbase returns records directly.
    // So we need to change `const records = await ...` to `const { data: records, error } = await ...`
    const varAssignRegex = /const ([a-zA-Z0-9_]+)\s*=\s*await supabase/g;
    content = content.replace(varAssignRegex, "const { data: $1, error } = await supabase");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
