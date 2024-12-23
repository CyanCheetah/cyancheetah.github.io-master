module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // all JS/TS files
    './public/index.html',          // entry HTML file
  ],
  css: ['./src/**/*.css'],         // all CSS files
  output: './dist/css/',           // output directory
  safelist: [
    /^show-/,      // preserve classes starting with 'show-'
    /^actor-/,     // preserve classes starting with 'actor-'
    'active',      // any other classes that might be added dynamically
  ]
} 