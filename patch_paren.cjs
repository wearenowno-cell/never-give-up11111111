const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                          </button>
                        ); })
                      )}`;

const replacement = `                          </button>
                        ) })
                      )}`;
code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed parens");
