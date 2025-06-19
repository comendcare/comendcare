import fs from 'fs'
import prisma from "@/lib/prisma"
export const dynamic = 'force-dynamic'; // Prevent caching

async function getPrismaSchema() {
    return fs.readFileSync('./prisma/schema.prisma', 'utf8');
}

// Step 1: Parse relation field names and their corresponding model types
function parseRelationMap(schema: string): Record<string, Record<string, string>> {
    const modelRegex = /model\s+(\w+)\s+{([\s\S]*?)}/g;
    const relationFieldRegex = /^\s+(\w+)\s+(\w+)(\[\])?(?!\s+@default|\s+@id|\s+@unique|\s+@map|\s+@updatedAt|\s+@createdAt).*$/gm;

    const relationMap: Record<string, Record<string, string>> = {};
    const modelNames = Array.from(schema.matchAll(/model\s+(\w+)/g)).map(m => m[1]);

    let modelMatch;
    while ((modelMatch = modelRegex.exec(schema)) !== null) {
        const modelName = modelMatch[1];
        const modelBody = modelMatch[2];
        const fields: Record<string, string> = {};

        let fieldMatch;
        while ((fieldMatch = relationFieldRegex.exec(modelBody)) !== null) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        if (modelNames.includes(fieldType)) {
            fields[fieldName] = fieldType;
        }
        }

        relationMap[modelName.toLowerCase()] = fields;
    }

    return relationMap;
}

// Step 2: Build include, to ensure all relations are included
function buildInclude(
  relationMap: Record<string, Record<string, string>>,
  modelName: string,
  depth = 2
): any {
  if (depth <= 0 || !relationMap[modelName]) return true;

  const includes: Record<string, any> = {};
  for (const [fieldName, relatedModelName] of Object.entries(relationMap[modelName])) {
    includes[fieldName] = true
  }

  console.log(includes)

  return includes;
}

// Step 3: Export data with dynamic includes
async function exportAllModelsToJSON() {
  const schema = await getPrismaSchema();
  const relationMap = parseRelationMap(schema);
  const output: Record<string, any[]> = {};

  const modelNames = Object.keys(prisma).filter(
    (key) => typeof (prisma as any)[key]?.findMany === 'function'
  );

  for (const modelName of modelNames) {
    const include = buildInclude(relationMap, modelName.toLowerCase(), 2);
    const data = await (prisma as any)[modelName].findMany({ include });
    output[modelName] = data;
  }

  await fs.writeFile(`${require('os').homedir()}/Desktop/export.json`, JSON.stringify(output, null, 2), () => {});
  console.log('Exported all models with relations!');
}

exportAllModelsToJSON()
