const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const clearFileRegex = /  const handleClearFile = useCallback\(async \(\) => \{\n(?:.|\n)*?filmstripFrames\]\);\n/;
const clearFileMatch = code.match(clearFileRegex);

if (clearFileMatch) {
  code = code.replace(clearFileMatch[0], '');
  code = code.replace(
    '  // --- Coordination handlers ---\n\n',
    '  // --- Coordination handlers ---\n\n' + clearFileMatch[0] + '\n'
  );
}

// Fix missing dependency appMode in handleFileUpload
code = code.replace(
  /targetHeight, filmstripFrames\]\);/,
  'targetHeight, filmstripFrames, appMode]);'
);

fs.writeFileSync('src/App.tsx', code);
