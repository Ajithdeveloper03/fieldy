const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if (file !== 'node_modules' && file !== '.expo' && file !== '.git') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};
const files = walkSync('./app').concat(walkSync('./components'));
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace font-gotham-* with font-brandon-*
  content = content.replace(/font-gotham-bold/g, 'font-brandon-bold');
  content = content.replace(/font-gotham-medium/g, 'font-brandon-medium');
  content = content.replace(/font-gotham-semibold/g, 'font-brandon-semibold');
  content = content.replace(/font-gotham/g, 'font-brandon');
  
  // Find all Text tags with className and ensure they have a font family
  content = content.replace(/<Text\s+className=["']([^"']*)["']/g, (match, classes) => {
    // If it already has a font-brandon or font-tiro class, leave it
    if (classes.includes('font-brandon') || classes.includes('font-gotham') || classes.includes('font-tiro') || classes.includes('font-tamil')) {
      return match;
    }
    
    // Otherwise, check for generic bold/medium/semibold and map them
    if (classes.includes('font-bold')) {
      return `<Text className="${classes.replace('font-bold', '')} font-brandon-bold"`;
    } else if (classes.includes('font-semibold')) {
      return `<Text className="${classes.replace('font-semibold', '')} font-brandon-semibold"`;
    } else if (classes.includes('font-medium')) {
      return `<Text className="${classes.replace('font-medium', '')} font-brandon-medium"`;
    } else {
      return `<Text className="${classes} font-brandon"`;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated fonts in ${file}`);
    updatedCount++;
  }
});

console.log(`Finished updating fonts in ${updatedCount} files.`);
