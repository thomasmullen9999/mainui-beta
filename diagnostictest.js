const { PrismaClient, LeadStatus } = require("@prisma/client");

const prisma = new PrismaClient();

async function diagnosticTest() {
  try {
    const testRecord = await prisma.leadHistory.findFirst();
    if (!testRecord) {
      console.log("No records found in leadHistory.");
      return;
    }

    console.log("Original record:", {
      id: testRecord.id,
      lead_status: testRecord.lead_status,
    });

    const updatedRecord = await prisma.leadHistory.update({
      where: { id: testRecord.id },
      data: { lead_status: LeadStatus.sold },
    });

    console.log("After update (Prisma returned):", {
      id: updatedRecord.id,
      lead_status: updatedRecord.lead_status,
    });

    const verifyRecord = await prisma.leadHistory.findUnique({
      where: { id: testRecord.id },
    });

    console.log("Verified record from DB:", {
      id: verifyRecord?.id,
      lead_status: verifyRecord?.lead_status,
    });
  } catch (err) {
    console.error("Error during diagnostic test:", err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticTest();
