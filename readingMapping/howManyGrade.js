import data from './kanjidic2-en-3.5.0.json' assert { type: 'json' };
// import json;
// data = json.load(open('kanjidic2-en-3.5.0.json'))

// console.log(data);

console.log(data.characters.filter(kanji => kanji.misc.grade != null).length);
console.log(data.characters.length);