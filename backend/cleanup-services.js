const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('olga_skincare.db');

console.log('🧹 Cleaning up duplicate services...');

// Services that should remain active (the good ones that are currently displayed)
const servicesToKeep = [
  'Classic European Facial',
  'Deep Cleansing Facial', 
  'Hydrating Facial',
  'Anti-Aging Treatment',
  'Chemical Peel',
  'OSMOSIS MD FACIAL',
  'Skin Analysis Consultation', 
  'Treatment Planning Session',
  'Classic Lash Extensions',
  'Volume Lash Extensions',
  'Lash Lift & Tint',
  'Eyebrow Shaping & Tint'
];

// First, deactivate ALL services
db.run('UPDATE services SET is_active = 0', (err) => {
  if (err) {
    console.error('Error deactivating services:', err);
    return;
  }
  
  console.log('✅ Deactivated all services');
  
  // Then reactivate only one good instance of each service we want to keep
  let completed = 0;
  
  servicesToKeep.forEach(serviceName => {
    // Find the best instance (one that's currently displayed) and reactivate it
    db.run(
      `UPDATE services SET is_active = 1 
       WHERE id = (
         SELECT MIN(id) FROM services 
         WHERE name = ? AND is_displayed = 1
       )`,
      [serviceName],
      function(err) {
        if (err) {
          console.error(`Error reactivating ${serviceName}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Reactivated: ${serviceName}`);
        } else {
          console.log(`⚠️  Not found: ${serviceName}`);
        }
        
        completed++;
        if (completed === servicesToKeep.length) {
          // Final count and summary
          db.get('SELECT COUNT(*) as count FROM services WHERE is_active = 1', (err, result) => {
            if (!err) {
              console.log(`\n🎉 Cleanup complete! Now showing ${result.count} services in admin panel.`);
              console.log('\n📝 Go to Admin → Services to see the cleaned up list!');
              console.log('🌐 Your public website will continue showing the same services as before.');
            }
            db.close();
          });
        }
      }
    );
  });
}); 