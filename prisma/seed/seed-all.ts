// prisma/seed/seed-all.ts
import { spawn } from "child_process";

const availableSeeds: Record<string, string> = {
    gene: "gene-seed.ts",
    cro: "cro-seed.ts",
    condition: "condition-seed.ts",
    institution: "institution-seed.ts",
    milestone: "milestone-types.ts",
    tools: "seed-tools.ts",
    tooltypes: "tool-types.ts",
    whitelist: "whitelist-seed.ts",
};

const args = process.argv.slice(2);
const selectedSeeds = args
    .filter(arg => arg.startsWith("--"))
    .map(arg => arg.replace("--", ""))
    .filter(seed => availableSeeds[seed]);

if (selectedSeeds.length === 0) {
    console.log("No valid seed flags provided. Available options:");
    console.log(Object.keys(availableSeeds).map(k => `--${k}`).join(" "));
    process.exit(1);
}

async function runSeed(seedFile: string) {
    return new Promise<void>((resolve, reject) => {
        const proc = spawn("tsx", [`prisma/seed/${seedFile}`], {
            stdio: "inherit",
            shell: true,
        });

        proc.on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${seedFile} exited with code ${code}`));
            }
        });
    });
}

(async () => {
    for (const seed of selectedSeeds) {
        const file = availableSeeds[seed];
        console.log(`\n🚀 Running ${file}...`);
        try {
            await runSeed(file);
            console.log(`✅ Completed ${file}`);
        } catch (err) {
            console.error(`❌ Failed ${file}:`, err);
        }
    }

    console.log("\n🌱 All selected seed scripts have completed.");
})();
