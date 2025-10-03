// scripts/exportLeadHistory.ts
const { PrismaClient } = require("@prisma/client");
const { Parser } = require("json2csv");
const fs = require("fs");

const prisma = new PrismaClient();

async function exportToCSV() {
  try {
    const data = await prisma.leadHistory.findMany({
      where: {
        lead_campaign: "justeat",
        lead_status: "nurture",
      },
    });

    if (data.length === 0) {
      console.log('No records found for campaign_name = "justeat".');
      return;
    }

    const parser = new Parser();
    const csv = parser.parse(data);
    fs.writeFileSync("leadhistory_justeat.csv", csv);
    console.log("CSV exported successfully!");
  } catch (error) {
    console.error("Error exporting data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportToCSV();
