import { PrismaClient } from "@prisma/client"
// @ts-ignore
import { withPulse } from '@prisma/extension-pulse'
import { tmpdir } from "os"
import fs from "fs"

// Function to write the decoded content to a file
function writeDecodedFile(filename: string, base64Content: string) {
    const filePath = `${tmpdir()}/${filename}`
    const contentBuffer = Buffer.from(base64Content, "base64")

    fs.writeFile(filePath, contentBuffer, err => {
        if (err) {
            console.log(`Error writing ${filename}:`, err)
        } else {
            console.log(`${filename} successfully written to temp directory`)
        }
    })
}

// In production, write certificates from environment variables to the /tmp/ directory
if (process.env.NODE_ENV === "production") {
    // Decode and write client-cert.pem
    if (process.env.CLIENT_CERT_BASE64) {
        writeDecodedFile("client-cert.pem", process.env.CLIENT_CERT_BASE64)
    } else {
        console.log("CLIENT_CERT_BASE64 environment variable is not set.")
    }

    // Decode and write client-key.pem
    if (process.env.CLIENT_KEY_BASE64) {
        writeDecodedFile("client-key.pem", process.env.CLIENT_KEY_BASE64)
    } else {
        console.log("CLIENT_KEY_BASE64 environment variable is not set.")
    }

    // Decode and write server-ca.pem
    if (process.env.SERVER_CA_BASE64) {
        writeDecodedFile("server-ca.pem", process.env.SERVER_CA_BASE64)
    } else {
        console.log("SERVER_CA_BASE64 environment variable is not set.")
    }
}

// Use global caching to prevent multiple instances of Prisma in development
declare global {
    var prisma: PrismaClient | undefined
}

// Use global caching for Prisma in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["info", "query", "error", "warn"]
                : ["error"]
    }).$extends(
        withPulse({
            apiKey: process.env['PULSE_API_KEY'] as string
        })
    ) as PrismaClient

if (process.env.NODE_ENV === "development") globalForPrisma.prisma = db
