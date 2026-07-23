const fs = require('fs');

const files = ['src/App.tsx', 'src/services/llm/provider.ts', 'src/routes/api.ts'];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/llama-3\.3-70b-versatile/g, 'deepseek-r1-distill-llama-70b');
    fs.writeFileSync(file, code);
  }
}
console.log("Upgraded Groq models to deepseek-r1-distill-llama-70b");
