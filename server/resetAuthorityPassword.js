
require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function main() {
    try {
        const email = "pishwaridutt@gmail.com";

        const password = await ask("Enter your new Authority password: ");

        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.authority.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log("\nAuthority password reset successfully!");

    } catch (error) {
        console.error("\nError:", error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
