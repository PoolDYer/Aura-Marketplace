const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
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

console.log(`Auditing ${files.length} source files...`);

let totalMethods = 0;
let untestedMethods = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Basic regex to find classes
  const classMatches = content.match(/class\s+(\w+)/g);
  if (!classMatches) continue;

  // Find all methods inside the class
  // We match lines like: async myMethod(...) or public myMethod(...) or myMethod(...)
  // Excluding constructor, keywords like if, for, catch, switch, return, etc.
  const lines = content.split('\n');
  const methods = [];
  
  for (const line of lines) {
    // Match potential method definitions:
    // e.g. "async myMethod(" or "public myMethod(" or "myMethod("
    // We filter out common keywords
    const match = line.match(/(?:public|private|protected|async|\s)*\b(\w+)\s*\(([^)]*)\)\s*(?::|{)/);
    if (match) {
      const methodName = match[1];
      const keywords = ['constructor', 'if', 'for', 'catch', 'switch', 'while', 'expect', 'describe', 'it', 'beforeEach', 'beforeAll', 'afterEach', 'afterAll', 'jest', 'require', 'import'];
      if (!keywords.includes(methodName) && !methodName.startsWith('_')) {
        methods.push({ name: methodName, line: line.trim() });
      }
    }
  }

  if (methods.length === 0) continue;

  // Look for spec file
  const specFile = file.replace('.ts', '.spec.ts');
  let specContent = '';
  if (fs.existsSync(specFile)) {
    specContent = fs.readFileSync(specFile, 'utf8');
  }

  const relativePath = path.relative(path.join(__dirname, '..', '..'), file);
  
  const fileUntested = [];
  for (const method of methods) {
    totalMethods++;
    // Check if method name is in colocated spec or consolidated specs
    const isInColocated = specContent.includes(method.name);
    const isInConsolidated = consolidatedContents.includes(method.name);
    
    if (!isInColocated && !isInConsolidated) {
      fileUntested.push(method.name);
      untestedMethods++;
    }
  }

  if (fileUntested.length > 0) {
    console.log(`\n❌ [${relativePath}] has untested methods:`);
    for (const name of fileUntested) {
      console.log(`   - ${name}`);
    }
  }
}

console.log('\n=======================================');
console.log(`Audit finished.`);
console.log(`Total methods found: ${totalMethods}`);
console.log(`Untested methods found: ${untestedMethods}`);
console.log(`Coverage by method reference: ${(((totalMethods - untestedMethods) / totalMethods) * 100).toFixed(2)}%`);
console.log('=======================================');
