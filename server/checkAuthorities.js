
require("dotenv").config();

const prisma = require("./db");

async function main() {
    const authorities = await prisma.authority.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            department: true
        }
    });

    console.log("\nRegistered Authority Accounts:");

    console.table(authorities);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
