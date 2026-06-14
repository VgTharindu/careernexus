const cron = require("node-cron");
const prisma = require("./db");

const startCronJobs = () => {
  // Run every hour — close expired jobs
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Running job expiry check...");

      const now = new Date();
      const expired = await prisma.job.findMany({
        where: {
          deadline: { lt: now },
          isApproved: true,
        },
      });

      if (expired.length > 0) {
        console.log(`Found ${expired.length} expired job(s) — closing...`);
        // Mark as not approved to hide from students
        await prisma.job.updateMany({
          where: {
            deadline: { lt: now },
            isApproved: true,
          },
          data: { isApproved: false },
        });
        console.log(`Closed ${expired.length} expired job(s)`);
      }
    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  });

  console.log("Cron jobs started — checking expired jobs every hour");
};

module.exports = { startCronJobs };
