const fs = require('fs');
const readline = require('readline');

let cedictFile = "cedict_ts.u8";
let outputFile = "cedict.json";
let outputS2TFile = "s2t.json";

function Entry(traditional, simplified, pinyin, definitions) {
	this.traditional = traditional;
	this.simplified = simplified;
	this.pinyin = pinyin;
	this.definitions = definitions;
}

function parseEntry(entry) {
	let firstSpace = entry.indexOf(' ');
	let secondSpace = entry.indexOf(' ', firstSpace + 1);
	let bracketsStart = entry.indexOf('[', secondSpace + 1);
	let bracketsEnd = entry.indexOf(']', bracketsStart + 1);
	let definitionsStart = entry.indexOf('/', bracketsEnd + 1);

	if (firstSpace <= 0 || secondSpace <= 0 || bracketsStart <= 0 || bracketsEnd <= 0 || definitionsStart <= 0) {
		console.log("Invalid entry: " + entry);
		return null;
	}

	let traditional = entry.substring(0, firstSpace);
	let simplified = entry.substring(firstSpace + 1, secondSpace);
	let pinyin = entry.substring(bracketsStart + 1, bracketsEnd);
	let definitions = entry.substring(definitionsStart + 1, entry.length - 1).split('/');

	return new Entry(traditional, simplified, pinyin, definitions);
}

function mergeEntries(existingEntry, newEntry) {
	if (existingEntry) {
		existingEntry.pinyin.push(newEntry.pinyin);
		existingEntry.definitions.push(newEntry.definitions);
	} else {
		existingEntry = {
			traditional: newEntry.traditional,
			simplified: newEntry.simplified,
			pinyin: [newEntry.pinyin],
			definitions: [newEntry.definitions]
		};
	}
	return existingEntry;
}

function getComponents(word, dictionary, processed = new Set(), startPosition = 0) {
	let components = [];

	// Base case: if the word is a single character, just return it if it exists in the dictionary
	if (word.length === 1 && dictionary[word]) {
		return [{
			text: word,
			position: [startPosition, startPosition + 1],
			entry: dictionary[word]
		}];
	}

	for (let length = word.length; length >= 1; length--) {
		for (let start = 0; start <= word.length - length; start++) {
			let substring = word.slice(start, start + length);

			// Add the condition to check if the substring is not equal to the original word
			if (substring !== word && dictionary[substring]) {
				let component = {
					text: substring,
					position: [start + startPosition, start + startPosition + length],
					entry: dictionary[substring]
				};
				// // Recurse into the component to find its subcomponents
				// component.components = getComponents(substring, dictionary, start + startPosition);
				components.push(component);
			}
		}
	}

	return components;
}

let entriesMap = {};
let s2TMap = {};

fs.access(cedictFile, (err) => {
	if (!err) {
		console.log("Reading from file \'" + cedictFile + "\'...");
		let rl = readline.createInterface({
			input: fs.createReadStream(cedictFile)
		});

		rl.on('line', function (line) {
			if (line.charAt(0) !== '#') {
				const entry = parseEntry(line);
				if (entry !== null) {
					// make the key the traditional entry because it will simplify the merging in of the japanese dictionary
					const traditional = entry.traditional;
					let existingEntry = entriesMap[traditional];
					existingEntry = mergeEntries(existingEntry, entry);
					entriesMap[traditional] = existingEntry;


					// then make a simplified to traditional mapping in another json file for when we parse everything with the go script
					const simplified = entry.simplified;
					s2TMap[simplified] = traditional;
				}
			}
		}).on('close', function () {

			// at this point we have an entry for every word in the dictionary without component information
			// now we need to get all the components of the word 

			// TODO
			// first we will merge in the japanese dictionary and then at this component step we need to convert the traditional
			// to japanese in case this entry is a japanese jukugo and is spelled differently in chinese traditional.
			let processedEntries = {};

			for (let traditional in entriesMap) {
				const entry = entriesMap[traditional];
				processedEntries[traditional] = {
					entry: entry,
					components: getComponents(traditional, entriesMap)
				};
			}

			console.log("Writing to file \'" + outputFile + "\'...");
			let data = JSON.stringify(processedEntries, null, '\t');

			fs.writeFile(outputFile, data, function (err) {
				if (err) {
					return console.error(err);
				}

				console.log("Completed: " + Object.keys(processedEntries).length + " entries written to " + outputFile + ".");
			});

			console.log("Writing to file \'" + outputS2TFile + "\'...");
			let s2TData = JSON.stringify(s2TMap, null, '\t');

			fs.writeFile(outputS2TFile, s2TData, function (err) {
				if (err) {
					return console.error(err);
				}

				console.log("Completed: " + Object.keys(s2TMap).length + " entries written to " + outputS2TFile + ".");
			});
		});
	} else {
		console.log("The input file " + cedictFile + " was not found. Exiting...");
	}
});