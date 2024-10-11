const { tmpdir } = require("os");
const fs = require("fs");

function writeDecodedFile(filename, base64Content) {
    const filePath = `${tmpdir()}/${filename}`;
    const contentBuffer = Buffer.from(base64Content, "base64");

    try {
        fs.writeFileSync(filePath, contentBuffer);
        console.log(`${filename} successfully written to ${filePath}`);
        console.log(`File exists: ${fs.existsSync(filePath)}`);
    } catch (err) {
        console.error(`Error writing ${filename}:`, err);
        throw err;
    }
}

if (process.env.CLIENT_CERT_BASE64) {
    writeDecodedFile("client-cert.pem", process.env.CLIENT_CERT_BASE64);
} else {
    console.error("CLIENT_CERT_BASE64 environment variable is not set.");
}

if (process.env.CLIENT_KEY_BASE64) {
    writeDecodedFile("client-key.pem", process.env.CLIENT_KEY_BASE64);
} else {
    console.error("CLIENT_KEY_BASE64 environment variable is not set.");
}

if (process.env.SERVER_CA_BASE64) {
    writeDecodedFile("server-ca.pem", process.env.SERVER_CA_BASE64);
} else {
    console.error("SERVER_CA_BASE64 environment variable is not set.");
}
