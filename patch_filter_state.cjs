const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `const [isSimulating, setIsSimulating] = useState(false);`;
const newState = `const [isSimulating, setIsSimulating] = useState(false);
  const [filterAssetCategory, setFilterAssetCategory] = useState<string>("ALL");
  const [filterValidation, setFilterValidation] = useState<string>("ALL");`;

if (code.includes(oldState)) {
  code = code.replace(oldState, newState);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched filter states in App.tsx");
} else {
  console.log("Failed to find state hook");
}
