
const bcrypt = require("bcryptjs");
const prisma = require("./db");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    try {
        const email = "pishwaridutt@gmail.com";

        rl.question("Enter your new authority password: ", async (password) => {
            try {
                if (!password || password.length < 8) {
                    console.log("Password must be at least 8 characters.");
                    return;
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                await prisma.authority.update({
                    where: { email },
                    data: { password: hashedPassword }
                });

                console.log("Authority password updated successfully!");
            } catch (error) {
                console.error("Password reset failed:", error.message);
            } finally {
                rl.close();
                await prisma.$disconnect();
            }
        });
    } catch (error) {
        console.error(error);
        rl.close();
        await prisma.$disconnect();
    }
}

main();
