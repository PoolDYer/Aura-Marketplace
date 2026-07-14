const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.ts') && !name.endsWith('.spec.ts') && !name.includes('node_modules')) {
      files.push(name);
    }
  }
  return files;
}

// Consolidated spec files to search for method calls as well
const consolidatedSpecs = [
  path.join(__dirname, '..', 'l03-application', 'services.core.spec.ts'),
  path.join(__dirname, '..', 'l01-presentation', 'controllers.spec.ts'),
  path.join(__dirname, '..', 'l05-infrastructure', 'infrastructure.spec.ts'),
  path.join(__dirname, '..', 'l02-agent', 'agent.spec.ts'),
];

const consolidatedContents = consolidatedSpecs.map(p => {
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf8');
  }
  return '';
}).join('\n');

const files = getFiles(path.join(__dirname, '..'));

const report = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..', '..'), file).replace(/\\/g, '/');
  
  // Extract classes
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  let classMatch;
  const classesInFile = [];
  while ((classMatch = classRegex.exec(content)) !== null) {
    classesInFile.push(classMatch[1]);
  }

  if (classesInFile.length === 0) continue;

  // Find spec file
  const specFile = file.replace('.ts', '.spec.ts');
  let specContent = '';
  const hasSpecFile = fs.existsSync(specFile);
  if (hasSpecFile) {
    specContent = fs.readFileSync(specFile, 'utf8');
  }

  // Parse lines to extract methods and their access modifier
  const lines = content.split('\n');
  const methods = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Regex for class methods: e.g., "async getProfile(" or "private getCurrency("
    // We ignore constructor, control flows, loops, etc.
    const methodMatch = line.match(/(?:(public|private|protected|async)\s+)*(async\s+)?\b(\w+)\s*\(([^)]*)\)\s*(?::|{)/);
    if (methodMatch) {
      const methodName = methodMatch[3];
      const keywords = ['constructor', 'if', 'for', 'catch', 'switch', 'while', 'expect', 'describe', 'it', 'beforeEach', 'beforeAll', 'afterEach', 'afterAll', 'jest', 'require', 'import', 'super', 'return'];
      if (!keywords.includes(methodName) && !methodName.startsWith('_')) {
        // Determine access modifier
        let isPrivate = line.includes('private') || line.includes('protected');
        methods.push({ name: methodName, isPrivate });
      }
    }
  }

  for (const className of classesInFile) {
    const classMethods = [];
    // Just map all methods in file to the class (since usually there is only 1 class per file)
    for (const m of methods) {
      const isTested = specContent.includes(m.name) || consolidatedContents.includes(m.name);
      classMethods.push({
        name: m.name,
        isPrivate: m.isPrivate,
        isTested
      });
    }

    report.push({
      file: relativePath,
      className,
      hasSpecFile,
      methods: classMethods
    });
  }
}

// Generate Markdown report output
let md = `# Reporte Detallado de Cobertura Estática\n\n`;
md += `| Archivo | Clase | Tiene Spec | Métodos Totales | Métodos Públicos Testeados | Métodos Privados | Cobertura Pública |\n`;
md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n`;

let totalClasses = 0;
let totalSpecs = 0;
let grandTotalMethods = 0;
let testedPublicMethods = 0;
let totalPrivateMethods = 0;

for (const entry of report) {
  totalClasses++;
  if (entry.hasSpecFile) totalSpecs++;

  const totalM = entry.methods.length;
  const privates = entry.methods.filter(m => m.isPrivate);
  const publics = entry.methods.filter(m => !m.isPrivate);
  const testedPublics = publics.filter(m => m.isTested);

  grandTotalMethods += totalM;
  totalPrivateMethods += privates.length;
  testedPublicMethods += testedPublics.length;

  const publicCoveragePct = publics.length > 0 
    ? `${((testedPublics.length / publics.length) * 100).toFixed(1)}%` 
    : 'N/A';

  md += `| [${path.basename(entry.file)}](file:///${path.resolve(__dirname, '..', '..', entry.file).replace(/\\/g, '/')}) | \`${entry.className}\` | ${entry.hasSpecFile ? '✅' : '❌'} | ${totalM} | ${testedPublics.length}/${publics.length} | ${privates.length} | **${publicCoveragePct}** |\n`;
}

const finalPublicPct = ((testedPublicMethods / (grandTotalMethods - totalPrivateMethods)) * 100).toFixed(2);

md += `\n## Resumen General\n\n`;
md += `* **Total de Clases**: ${totalClasses}\n`;
md += `* **Clases con Spec File**: ${totalSpecs} (${((totalSpecs / totalClasses) * 100).toFixed(2)}%)\n`;
md += `* **Métodos Totales**: ${grandTotalMethods}\n`;
md += `* **Métodos Privados**: ${totalPrivateMethods}\n`;
md += `* **Métodos Públicos Cubiertos**: ${testedPublicMethods} / ${grandTotalMethods - totalPrivateMethods} (**${finalPublicPct}%**)\n`;

console.log(md);
fs.writeFileSync(path.join(__dirname, 'coverage-summary-report.md'), md, 'utf8');
