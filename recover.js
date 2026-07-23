import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:3000/src/App.tsx');
  const text = await res.text();
  const match = text.match(/sourceMappingURL=data:application\/json;base64,(.*)$/);
  if (match) {
    const base64 = match[1];
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const sm = JSON.parse(json);
    if (sm.sourcesContent && sm.sourcesContent.length > 0) {
      fs.writeFileSync('src/App.tsx', sm.sourcesContent[0]);
      console.log("Recovered App.tsx! Length:", sm.sourcesContent[0].length);
    } else {
      console.log("No sourcesContent found.");
    }
  } else {
    console.log("No sourcemap found in response.");
  }
}
run();
