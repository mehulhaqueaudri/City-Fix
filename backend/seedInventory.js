const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');

mongoose.connect('mongodb://127.0.0.1:27017/cityfix')
  .then(async () => {
    console.log("Connected to MongoDB");

    const materials = [
      { itemName: 'Cement', quantity: 200, costPerUnit: 450, unit: 'bags', alarmThreshold: 20 },
      { itemName: 'Asphalt', quantity: 150, costPerUnit: 800, unit: 'bags', alarmThreshold: 15 },
      { itemName: 'Steel Rod', quantity: 500, costPerUnit: 120, unit: 'units', alarmThreshold: 50 },
      { itemName: 'Sand', quantity: 300, costPerUnit: 250, unit: 'bags', alarmThreshold: 30 },
      { itemName: 'Brick', quantity: 1000, costPerUnit: 15, unit: 'units', alarmThreshold: 100 },
      { itemName: 'PVC Pipe', quantity: 80, costPerUnit: 350, unit: 'meters', alarmThreshold: 10 },
      { itemName: 'LED Street Light', quantity: 50, costPerUnit: 2500, unit: 'units', alarmThreshold: 5 },
      { itemName: 'White Paint', quantity: 60, costPerUnit: 600, unit: 'gallons', alarmThreshold: 8 },
      { itemName: 'Drainage Cover', quantity: 25, costPerUnit: 1800, unit: 'units', alarmThreshold: 5 },
      { itemName: 'Electric Cable', quantity: 400, costPerUnit: 45, unit: 'meters', alarmThreshold: 50 },
    ];

    for (const mat of materials) {
      const existing = await Inventory.findOne({ itemName: mat.itemName });
      if (!existing) {
        await Inventory.create(mat);
        console.log(`✅ Added: ${mat.itemName}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${mat.itemName}`);
      }
    }

    console.log("\n🎉 Inventory seeded successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
  });
