const res = await fetch('http://localhost:3000');
const html = await res.text();
const cssLinks = [...html.matchAll(/href="([^"]*\.css[^"]*)"/g)].map(m => m[1]);

console.log('=== FINAL VERIFICATION ===');
console.log('Page status:', res.status);
console.log('CSS files found:', cssLinks.length);

for (const link of cssLinks) {
  const url = link.startsWith('http') ? link : 'http://localhost:3000' + link;
  const cssRes = await fetch(url);
  const css = await cssRes.text();
  console.log('\nCSS file:', link);
  console.log('  Size:', css.length, 'bytes');
  console.log('  Has .navbar:', css.includes('.navbar'));
  console.log('  Has .hero:', css.includes('.hero'));
  console.log('  Has .project-card:', css.includes('.project-card'));
  console.log('  Has .exp-card:', css.includes('.exp-card'));
  console.log('  Has .cert-card:', css.includes('.cert-card'));
  console.log('  Has dark bg (#030712):', css.includes('030712'));
  console.log('  Has backdrop-filter:', css.includes('backdrop-filter'));
  console.log('  Has fadeUp animation:', css.includes('fadeUp'));
  console.log('  Has glassmorphism:', css.includes('blur(16px)'));
}

console.log('\n=== CONTENT CHECK ===');
console.log('Navbar:', html.includes('MUNI') && html.includes('PRASAD'));
console.log('Hero badge:', html.includes('Open for New Roles'));
console.log('Hero title:', html.includes('Cloud Consultant'));
console.log('Projects section:', html.includes('Featured'));
console.log('Experience section:', html.includes('OLR Retail'));
console.log('Certifications:', html.includes('AWS Certified'));
console.log('Footer:', html.includes('All rights reserved'));
console.log('\n✅ VERDICT:', res.status === 200 ? 'PAGE IS LIVE' : 'PAGE HAS ISSUES');
