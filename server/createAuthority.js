
require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function createAuthority() {
    try {
        console.log("\n========== CREATE AUTHORITY ACCOUNT ==========\n");

        const name = await askQuestion("Officer name: ");
        const email = await askQuestion("Officer email: ");
        const department = await askQuestion("Department: ");
        const password = await askQuestion("Create password: ");

        if (!name || !email || !department || !password) {
            console.log("\nAll fields are required.");
            return;
        }

        const existingAuthority = await prisma.authority.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });

        if (existingAuthority) {
            console.log("\nAn authority account with this email already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const authority = await prisma.authority.create({
            data: {
                name,
                email: email.toLowerCase(),
                department,
                password: hashedPassword,
            },
        });

        console.log("\nAuthority account created successfully!");
        console.log("----------------------------------------");
        console.log("Name:", authority.name);
        console.log("Email:", authority.email);
        console.log("Department:", authority.department);
        console.log("Authority ID:", authority.id);
        console.log("----------------------------------------");
    } catch (error) {
        console.error("\nError creating authority:", error.message);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

createAuthority();
