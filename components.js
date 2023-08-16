const fs = require('fs');

var inputFile = "cedict.json";
var outputFile = "cedict_with_components.json";

fs.readFile(inputFile, 'utf8', function (err, data) {
	if (err) {
		return console.error("Error reading file:", err);
	}

	const originalEntries = JSON.parse(data);
	let processedEntries = {};
	function getComponents(word, dictionary, processed = new Set(), startPosition = 0) {
		let components = [];

		// Base case: if the word is a single character, just return it if it exists in the dictionary
		if (word.length === 1 && dictionary[word]) {
			return [{
				text: word,
				position: [startPosition, startPosition + 1],
				entry: dictionary[word],
				components: {}
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
						entry: dictionary[substring],
						components: {}
					};
					// Recurse into the component to find its subcomponents
					component.components = getComponents(substring, dictionary, start + startPosition);
					components.push(component);
				}
			}
		}

		return components;
	}


	// // Example dictionary
	// const dictionary = {
	// 	'冠': 'entry for 冠',
	// 	'状': 'entry for 状',
	// 	'病': 'entry for 病',
	// 	'毒': 'entry for 毒',
	// 	'冠状': 'entry for 冠状',
	// 	'病毒': 'entry for 病毒',
	// 	'冠状病毒': 'entry for 冠状病毒'
	// };

	// const result = getComponents('2019冠状病毒病', dictionary);
	// console.log(result);



	// Iterate through the original entries and find components
	for (let simplified in originalEntries) {
		const entry = originalEntries[simplified];
		processedEntries[simplified] = {
			entry: entry,
			components: getComponents(simplified, originalEntries)
		};
	}

	// Write the output to a new file
	fs.writeFile(outputFile, JSON.stringify(processedEntries, null, '\t'), function (err) {
		if (err) {
			return console.error("Error writing file:", err);
		}

		console.log("Completed: " + Object.keys(processedEntries).length + " entries written.");
	});
});
