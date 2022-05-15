const submitButton = document.getElementById('submit-button')
const textArea = document.getElementById("paste");
const output = document.getElementById("output");

submitButton.addEventListener("click", submit);
textArea.addEventListener("paste", paste);

function submit() {
	let gradingPeriodName = output.querySelector(".td-content-wrapper > .title").childNodes[0].textContent;
	// console.log(gradingPeriodName);

	// let categoryNames = output.querySelectorAll()

	// let assignmentNames = output.querySelectorAll(".title-column .title :not(.item-row, .visually-hidden)");
	// console.log(assignmentNames);

	let allLines = Array.from(output.querySelectorAll(".report-row"));
	let allTitles = allLines.map((e) => e.querySelector(".title").childNodes[0]);
	// console.log(allTitles);

	let gradebook = []
		/*[
		{
			name: "",
			weight: "5%",
			assignments: [
				{
					title: "",
					score: 0,
					outOf: 0,
				},
			],
		},
	];*/

	//allTitles.shift()
	// allTitles = allTitles.filter((t) => t.textContent !== "(no grading period)" && t.textContent !== gradingPeriodName);

	const gradeColumn = Array.from(output.querySelectorAll(".grade-column > .td-content-wrapper > .awarded-grade")).map((e) => e.textContent);
	const sectionGradePercents = gradeColumn.filter((e) => e.includes("%"));
	const awardedGrades = gradeColumn.filter((e) => !e.includes("%"));

	const outOfGrades = Array.from(output.querySelectorAll(".grade-column > .td-content-wrapper > .max-grade")).map((e) => e.textContent.slice(2));

	//console.log(awardedGrades)
	//console.log(outOfGrades)

	const sectionWeights = Array.from(output.querySelectorAll(".percentage-contrib")).map((e) => e.textContent.slice(1, e.textContent.length - 2));
	// Array.from(output.querySelectorAll("reportSpacer-2 > td-content-wrapper > percentage-contrib")).map((e) => e.textContent.slice(1, e.textContent.length - 2));
	// console.log(sectionWeights);

	let assignIndex = 0;
	let sectionIndex = 0;
	allTitles.forEach((e) => {
		// console.log(e);
		if (e.childNodes.length == 0) {
			gradebook.push({ name: e.textContent, weight: Number.parseFloat(sectionWeights[sectionIndex])/100, assignments: [] });
			sectionIndex++;
		} else {
			const assignment = {
				title: e.childNodes[0].textContent,
				score: (awardedGrades[assignIndex] == undefined ? "-" : Number.parseFloat(awardedGrades[assignIndex])),
				outOf: (outOfGrades[assignIndex] == undefined ? "-" : Number.parseFloat(outOfGrades[assignIndex])),
			};
			gradebook[gradebook.length - 1].assignments.push(assignment);
			assignIndex++;
		}
	});

	gradebook = gradebook.filter((section) => (section.weight != 0 && section.name !== gradingPeriodName))

	console.log(gradebook);
	generateSpreadsheet(gradebook)
}

function generateSpreadsheet(gradebook) {
	const headerTitles = ["Section", "Weight", "Assignment", "Grade", "Maximum", ""]

	const bodyRows = [headerTitles];
	gradebook.forEach((section) => {
		let sectionInfo = [section.name, { t: "n", z: "0%", v: section.weight, s: { font: { color: { rgb: "777777" } } } }];
		sectionInfo = formattedCells(sectionInfo, { border: { bottom: { color: { rgb: "CACACA" } }, style: "hair"  }, alignment: {wrapText: true} });
		
		let assignmentRows = section.assignments.map((a) => [null, null, a.title, { t: (typeof a.score).charAt(0), v: a.score, s: { font: { color: { rgb: "00B050" }, bold: true } } }, a.outOf]);
		assignmentRows.push([]) // Empty row so people can add their own assignments

		// Totaling function
		const gradeCol = headerTitles.indexOf("Grade");
		const maxCol = headerTitles.indexOf("Maximum");

		const startRow = bodyRows.length + 1
		const endRow = startRow + assignmentRows.length - 1;

		const gradeRange = { s: { r: startRow, c: gradeCol }, e: { r: endRow, c: gradeCol } };
		const maxRange = { s: { r: startRow, c: maxCol }, e: { r: endRow, c: maxCol } };

		const gradeRangeEncoded = XLSX.utils.encode_range(gradeRange); // Encoding converts from numbers to A1 notation
		const maxRangeEncoded = XLSX.utils.encode_range(maxRange);

		const func = { t: "n", z: "0.00%", f: `IFERROR(SUMIFS(${gradeRangeEncoded},${gradeRangeEncoded},">=0",${maxRangeEncoded}, ">=0")/SUMIFS(${maxRangeEncoded},${gradeRangeEncoded},">=0",${maxRangeEncoded}, ">=0"), "-")`, D: true }; // SUMIFS ensures that grades where any component is marked with a '-' are not counted.

		let totalRow = [null, null, "Total", func]
		totalRow = formattedCells(totalRow, { font: { italic: true }, fill: { fgColor: { rgb: "B7DEE8" } } });

		bodyRows.push(sectionInfo, ...assignmentRows, totalRow, []);
	});

	// Course grade calc
	const totalGradeFunc = { t: "n", z: "0.00%", f: `SUMPRODUCT(IF(ISNUMBER(_xlfn.FILTER(D:D, C:C="TOTAL")), _xlfn.FILTER(B:B,ISNUMBER(B:B)), 0)/SUM(IF(ISNUMBER(_xlfn.FILTER(D:D, C:C="TOTAL")), _xlfn.FILTER(B:B,ISNUMBER(B:B)), 0)), _xlfn.FILTER(D:D, C:C="TOTAL"))`, D: false };

	
	bodyRows[0] = formattedCells(bodyRows[0], { font: { bold: true, sz: 14 }, border: { bottom: true } });
	bodyRows[0].push(...formattedCells(["Course Grade"], { font: { sz: 18, bold: true }, border: { bottom: true } }));
	bodyRows[0].push(...formattedCells([totalGradeFunc], { font: { sz: 18, color: { rgb: "00B050" }, bold: true }, border: {bottom: true} }));


	
	const worksheet = XLSX.utils.aoa_to_sheet(bodyRows);
	console.log(worksheet["!cols"])
	worksheet['!cols'] = [
		{wpx: 150}, {wch: 10}, { wch: 60 }, {wch: 10}, {wch: 10}, {wch: 10}, { wpx: 114 }, {wpx: 106}
	]
	// console.log(worksheet);
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, "Gradebook")
	XLSX.writeFile(workbook, "gradebook.xlsx");
}


function paste(event) {
	let paste = (event.clipboardData || window.clipboardData).getData("text/html");

	//console.log(paste);
	output.innerHTML = paste;

	submit();
}

let formattedCells = (cells, format) => {
	return cells.map((cell) => {
		if (cell == null) {
			return cell;
		}

		if (typeof cell == "string" || typeof cell == "number") {
			return {
				t: (typeof cell).charAt(0),
				v: cell,
				s: format,
			};
		}

		cell["s"] = { ...cell["s"], ...format };
		return cell;
	})
}
	
	

// DEBUG
// debugOutput()