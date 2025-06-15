import { getStorage } from "./storage";

export async function seedDatabase() {
  const storage = await getStorage();

  // Check if data already exists
  const existingQuestions = await storage.getQuestions({ limit: 1 });
  if (existingQuestions.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Seeding database with sample data...");

  // Sample questions for enterprise software troubleshooting
  const sampleQuestions = [
    {
      title: "Omniscan scanner not detecting RFID tags after Windows update",
      description: "After the latest Windows 11 update (KB5032190), our Omniscan RFID scanner is no longer detecting tags. The device manager shows the scanner as connected but the software reports 'No tags found' even when tags are placed directly on the reader.\n\nSteps tried:\n- Restarted the service\n- Reinstalled drivers\n- Tested with different tags\n- Checked USB connections\n\nError log shows: 'RFID_ERROR_TIMEOUT: Device communication timeout after 5000ms'",
      software: "omniscan",
      operatingSystem: "Windows 11",
      softwareVersion: "Omniscan v6.2.1",
      priority: "high",
      authorId: 1,
      authorName: "John Doe",
      tags: ["rfid", "windows-update", "driver-issue", "timeout"],
    },
    {
      title: "SoftTrac inventory sync failing with database connection error",
      description: "Our SoftTrac system is failing to sync inventory data with the central database. The sync process starts but fails after about 30 seconds with a connection timeout.\n\nEnvironment:\n- SoftTrac Server 2023.1\n- SQL Server 2019\n- Network latency: ~50ms\n\nError message: 'Connection to SQL Server lost during bulk insert operation. Transaction rolled back.'",
      software: "softtrac",
      operatingSystem: "Windows Server 2019",
      softwareVersion: "SoftTrac Server 2023.1",
      priority: "medium",
      authorId: 1,
      authorName: "John Doe",
      tags: ["database", "sync", "connection-timeout", "sql-server"],
    },
    {
      title: "IBML scanner producing blank scans intermittently",
      description: "Our IBML document scanner (Model DS-6500) is producing blank scans about 20% of the time. The issue occurs randomly - sometimes it scans perfectly, other times the output is completely white.\n\nObservations:\n- Happens with different document types\n- Glass is clean\n- Rollers recently replaced\n- Issue started after power outage last week\n\nCalibration reports show normal values for all sensors.",
      software: "ibml-scanners",
      operatingSystem: "Windows 10",
      softwareVersion: "IBML Scanner Suite v4.8",
      priority: "medium",
      authorId: 1,
      authorName: "John Doe",
      tags: ["scanning", "hardware", "calibration", "power-issue"],
    },
    {
      title: "Network scanning stations losing connection to central server",
      description: "Multiple scanning stations across our network are intermittently losing connection to the central processing server. Connection drops happen 2-3 times per day and require manual reconnection.\n\nNetwork setup:\n- 15 scanning stations\n- Gigabit ethernet\n- Cisco switches\n- Windows domain environment\n\nEvent logs show: 'RPC server unavailable' errors on client machines.",
      software: "network-tools",
      operatingSystem: "Windows 10",
      softwareVersion: "Network Scanner v3.2",
      priority: "high",
      authorId: 1,
      authorName: "John Doe",
      tags: ["network", "rpc", "connection", "infrastructure"],
    },
    {
      title: "Database backup job failing with insufficient disk space",
      description: "Our nightly database backup job has been failing for the past 3 days with 'insufficient disk space' errors, even though the backup drive shows 2TB free space.\n\nBackup details:\n- Database size: ~800GB\n- Backup drive: 4TB external\n- Backup type: Full backup\n- Compression enabled\n\nError suggests temporary files are filling up the system drive during backup process.",
      software: "database-tools",
      operatingSystem: "Windows Server 2022",
      softwareVersion: "SQL Server 2022",
      priority: "high",
      authorId: 1,
      authorName: "John Doe",
      tags: ["backup", "disk-space", "sql-server", "maintenance"],
    },
    {
      title: "Omniscan barcode reader not working with new label format",
      description: "We recently switched to a new barcode label format (Code 128 instead of Code 39) and our Omniscan readers are having trouble scanning them consistently. Success rate is about 60% compared to 99% with the old format.\n\nLabel specifications:\n- Code 128 format\n- 300 DPI printing\n- White background, black bars\n- Size: 2\" x 1\"\n\nReader settings may need adjustment for the new format.",
      software: "omniscan",
      operatingSystem: "Windows 10",
      softwareVersion: "Omniscan v6.1.8",
      priority: "medium",
      authorId: 1,
      authorName: "John Doe",
      tags: ["barcode", "code128", "scanning", "configuration"],
    }
  ];

  // Create sample questions
  for (const questionData of sampleQuestions) {
    const question = await storage.createQuestion(questionData);
    
    // Add some sample answers for the first few questions
    if (question.id <= 3) {
      const sampleAnswers = [
        {
          questionId: question.id,
          content: question.id === 1 
            ? "This is a known issue with Windows 11 KB5032190. The update changed the USB power management settings.\n\nSolution:\n1. Open Device Manager\n2. Find your Omniscan device under 'Universal Serial Bus controllers'\n3. Right-click → Properties → Power Management\n4. Uncheck 'Allow the computer to turn off this device to save power'\n5. Restart the Omniscan service\n\nThis should resolve the timeout errors. We've seen this fix work for multiple customers."
            : question.id === 2
            ? "This looks like a network timeout issue combined with large transaction size.\n\nTry these steps:\n1. Increase the connection timeout in SoftTrac config (default is 30s, try 120s)\n2. Enable batch processing to break large syncs into smaller chunks\n3. Check if your SQL Server has sufficient memory allocated\n4. Consider running sync during off-peak hours\n\nAlso verify that no firewall rules are interfering with the database connection."
            : "The blank scan issue after power outage suggests a sensor calibration problem.\n\nRecalibration steps:\n1. Access the IBML diagnostic menu (Ctrl+Alt+D while scanner software is open)\n2. Run 'Full Sensor Calibration' - this takes about 10 minutes\n3. Clean all internal sensors with the provided cleaning kit\n4. Test with various document types\n\nIf the issue persists, there may be hardware damage from the power surge. Check if your UPS was functioning during the outage.",
          authorId: 1,
          authorName: "John Doe"
        }
      ];

      for (const answerData of sampleAnswers) {
        const answer = await storage.createAnswer(answerData);
        
        // Mark the first answer as accepted for question 1
        if (question.id === 1) {
          await storage.updateAnswer(answer.id, { isAccepted: true });
        }
      }

      // Add some votes to make the data more realistic
      await storage.createVote({
        userId: 1,
        questionId: question.id,
        type: "up"
      });
    }
  }

  console.log("Database seeded successfully with sample enterprise software troubleshooting data");
}