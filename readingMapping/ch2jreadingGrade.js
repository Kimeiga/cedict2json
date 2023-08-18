import data from './kanjidic2-en-3.5.0.json' assert { type: 'json' };
// import hepburn from 'hepburn';
import { toRomaji } from 'wanakana';
import util from 'util';
import fs from 'fs';

const mapPinyinToOn = {};

// const characters = data.characters;

// for (const iterator of object) {

// }

console.log(data.characters.entries());

for (const [index, kanji] of data.characters.entries()) {
	// console.log(index, kanji)
	if (!kanji.hasOwnProperty('readingMeaning')) {
		console.log(kanji);
	}
	if (!kanji.readingMeaning.hasOwnProperty('groups')) {
		console.log(kanji);
	}
	const pinyinReadings = [];
	const onReadings = [];

	if (kanji.misc.grade == null) {
		continue;
	}

	for (const reading of kanji.readingMeaning.groups[0].readings) {

		if (reading.type === 'pinyin') {
			// strip numbers from pinyin string
			const pinyin = reading.value.replace(/\d/g, '');

			// filter out readings that have ^ in it
			if (pinyin.includes('^')) {
				continue;
			}

			// if pinyin string has spaces between readings, separate them
			if (pinyin.includes(' ')) {
				const pinyinSplit = pinyin.split(' ');
				pinyinReadings.push(...pinyinSplit);
				continue;
			}

			pinyinReadings.push(pinyin);
		}
		if (reading.type === 'ja_on') {

			// convert katakana to romaji
			const romaji = toRomaji(reading.value);

			onReadings.push({ romaji, kanji: kanji.literal });
		}

	}

	// if no onyomi reading, skip
	if (onReadings.length === 0) {
		continue;
	}

	// map pinyin to on readings
	for (const pinyinReading of pinyinReadings) {
		if (!mapPinyinToOn[pinyinReading]) {
			mapPinyinToOn[pinyinReading] = [];
		}

		mapPinyinToOn[pinyinReading].push(...onReadings);
	}
}

// // now we calculate the percentage of the time that a pinyin reading maps to an on reading
// const mapPinyinToOnPercentages = {};

// // condense mapPinyinToOn to a dictionary of pinyin readings to a dictionary of on readings to percentages and kanji



// for (const pinyinReading in mapPinyinToOn) {
// 	const onReadings = mapPinyinToOn[pinyinReading];

// 	const dict = {};

// 	for (const item of onReadings) {
// 		if (dict[item.romaji]) {
// 			dict[item.romaji]++;
// 		} else {
// 			dict[item.romaji] = 1;
// 		}
// 	}

// 	const frequencies = Object.entries(dict).reduce((acc, [onyomi, value]) => {
// 		acc[omyomi] = { percentage: value / onReadings.length * 100 + '%', kanjis: [] };
// 		return acc;
// 	}, {});

// 	// const percentage = onReadings.length / data.characters.length;

// 	mapPinyinToOnPercentages[pinyinReading] = frequencies;
// }

// console.log(mapPinyinToOn);
// console.log(mapPinyinToOnPercentages);

// const result = {};

// for (const entry of Object.entries(mapPinyinToOn)) {
// 	for (const pinyin in entry) {
// 		const romajiFrequencies = {};
// 		const romajiKanjis = {};
// 		const totalCount = entry[pinyin].length;

// 		for (const e of entry[pinyin]) {
// 			const { romaji, kanji } = e;
// 			romajiFrequencies[romaji] = (romajiFrequencies[romaji] || 0) + 1;

// 			if (!romajiKanjis[romaji]) {
// 				romajiKanjis[romaji] = new Set();
// 			}
// 			romajiKanjis[romaji].add(kanji);
// 		}

// 		result[pinyin] = {};

// 		for (const romaji in romajiFrequencies) {
// 			result[pinyin][romaji] = {
// 				percentage: (romajiFrequencies[romaji] / totalCount) * 100,
// 				kanjis: [...romajiKanjis[romaji]]
// 			};
// 		}
// 	}
// }

// console.log(result);

function processMap(dataMap) {
	const result = {};

	for (let pinyin in dataMap) {
		const romajiFrequencies = {};
		const romajiKanjis = {};
		const totalCount = dataMap[pinyin].length;

		for (let entry of dataMap[pinyin]) {
			const romaji = entry.romaji;
			const kanji = entry.kanji;

			romajiFrequencies[romaji] = (romajiFrequencies[romaji] || 0) + 1;

			if (!romajiKanjis[romaji]) {
				romajiKanjis[romaji] = new Set();
			}
			romajiKanjis[romaji].add(kanji);
		}

		result[pinyin] = {};

		for (let romaji in romajiFrequencies) {
			result[pinyin][romaji] = {
				'percentage': (romajiFrequencies[romaji] / totalCount) * 100,
				'kanjis': [...romajiKanjis[romaji]]
			};
		}
	}

	return result;
}

const processedMap = processMap(mapPinyinToOn);

// write processedMap to json file
fs.writeFileSync('processedMap2.json', JSON.stringify(processedMap, null, 2), 'utf8');


console.log(util.inspect(processedMap, { depth: null, colors: true }));

// console.log(processedMap);
function generateHTML(data) {
	let tableRows = '';

	for (let pinyin in data) {
		for (let romaji in data[pinyin]) {
			const percentage = data[pinyin][romaji].percentage.toFixed(2);
			const kanjis = data[pinyin][romaji].kanjis.join(', ');

			tableRows += `
        <tr>
          <td>${pinyin}</td>
          <td>${romaji}</td>
          <td>${percentage}%</td>
          <td>${kanjis}</td>
        </tr>
      `;
		}
	}

	const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pinyin to On'yomi Mapping</title>
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
        </style>
    </head>
    <body>
        <h2>Pinyin to On'yomi Mapping</h2>
        <table>
            <thead>
                <tr>
                    <th>Pinyin</th>
                    <th>On'yomi (Romaji)</th>
                    <th>Percentage</th>
                    <th>Kanjis</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </body>
    </html>
  `;

	return htmlContent;
}

const html = generateHTML(processedMap);
fs.writeFileSync('output2.html', html, 'utf8');
console.log("HTML file generated as 'output.html'");
