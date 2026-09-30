const http = require('http');

const DEMO_EVENT_ID = 'f8c2e5d3-9520-5b0d-0ec9-234567890bcd';

const routesToTest = [
  { path: '/', expected: 'SocietyStage' },
  { path: '/admin', expected: 'Admin' },
  { path: '/admin/events', expected: 'Events' },
  { path: '/admin/events/new', expected: 'Create' },
  { path: '/admin/participants', expected: 'Participant' },
  { path: '/admin/lineup', expected: 'Lineup' },
  { path: '/admin/volunteers', expected: 'Volunteer' },
  { path: '/admin/judges', expected: 'Judge' },
  { path: '/admin/reports', expected: 'Report' },
  { path: '/admin/members', expected: 'Member' },
  { path: '/admin/audit', expected: 'Audit' },
  { path: '/admin/settings', expected: 'Settings' },
  { path: '/resident', expected: 'Resident' },
  { path: '/resident/events', expected: 'Event' },
  { path: `/resident/events/${DEMO_EVENT_ID}`, expected: 'Festival' },
  { path: `/resident/events/${DEMO_EVENT_ID}/register`, expected: 'Register' },
  { path: '/resident/my-participation', expected: 'Participation' },
  { path: '/resident/notifications', expected: 'Alert' },
  { path: '/resident/profile', expected: 'Profile' },
  { path: `/events/${DEMO_EVENT_ID}/live`, expected: 'Live' },
  { path: `/events/${DEMO_EVENT_ID}/display`, expected: 'Display' },
];

function testRoute(route) {
  return new Promise((resolve) => {
    const url = `http://localhost:3000${route.path}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const passed = res.statusCode === 200;
        resolve({
          path: route.path,
          status: res.statusCode,
          passed,
          length: data.length,
        });
      });
    }).on('error', (err) => {
      resolve({
        path: route.path,
        status: 0,
        passed: false,
        error: err.message,
      });
    });
  });
}

async function runAllPageTests() {
  console.log(`Starting automated route checks across ${routesToTest.length} pages...\n`);
  let allPassed = true;

  for (const r of routesToTest) {
    const result = await testRoute(r);
    const statusIcon = result.passed ? '✓' : '✗';
    console.log(`${statusIcon} [${result.status}] ${result.path} (${result.length || 0} bytes)`);
    if (!result.passed) {
      allPassed = false;
      if (result.error) console.error(`   Error: ${result.error}`);
    }
  }

  console.log('\n----------------------------------------');
  if (allPassed) {
    console.log(`🎉 ALL ${routesToTest.length} PAGES RESPONDED 200 OK!`);
  } else {
    console.error('⚠️ Some routes failed verification.');
    process.exit(1);
  }
}

runAllPageTests();
