
require("dotenv").config();

const prisma = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    try {
        const oldEmail = (await ask("Enter the CURRENT email: "))
            .trim()
            .toLowerCase();

        const newEmail = (await ask("Enter the CORRECT email: "))
            .trim()
            .toLowerCase();

        if (!oldEmail || !newEmail || !newEmail.includes("@")) {
            throw new Error("Please enter valid email addresses.");
        }

        const authority = await prisma.authority.findUnique({
            where: { email: oldEmail }
        });

        if (!authority) {
            throw new Error("Authority account not found.");
        }

        const existing = await prisma.authority.findUnique({
            where: { email: newEmail }
        });

        if (existing) {
            throw new Error("The new email is already being used.");
        }

        const updated = await prisma.authority.update({
            where: { email: oldEmail },
            data: { email: newEmail }
        });

        console.log("\nEmail updated successfully!");
        console.log("Officer:", updated.name);
        console.log("New email:", updated.email);

    } catch (error) {
        console.error("\nError:", error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
