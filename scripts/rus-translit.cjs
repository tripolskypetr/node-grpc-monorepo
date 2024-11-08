const slugify = require('translit-rus-eng');
const args = process.argv.slice(2);
console.log(slugify(args.join('_'), { slug: true }));
