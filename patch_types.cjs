const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
if (!code.includes('convertToLimit?: boolean;')) {
  code = code.replace('currentJobInterval?: any;', 'currentJobInterval?: any;\n    convertToLimit?: boolean;');
  code = code.replace('jobInterval?: any;', 'jobInterval?: any;\n    convertToLimit?: boolean;');
  fs.writeFileSync('src/types.ts', code);
}
