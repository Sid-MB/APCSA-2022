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
	const headerTitles = ["Section", "Weight", "Assignment", "Grade", "Maximum", null, "Course Grade"];

	const bodyRows = [headerTitles];
	gradebook.forEach((section) => {
		let sectionInfo = [section.name, {t: "n", z: "0%", v: section.weight}];
		let assignmentRows = section.assignments.map((a) => [null, null, a.title, a.score, a.outOf])

		// Totaling function
		const gradeCol = headerTitles.indexOf("Grade");
		const maxCol = headerTitles.indexOf("Maximum");

		const startRow = bodyRows.length + 1
		const endRow = startRow + assignmentRows.length - 1;

		const gradeRange = { s: { r: startRow, c: gradeCol }, e: { r: endRow, c: gradeCol } };
		const maxRange = { s: { r: startRow, c: maxCol }, e: { r: endRow, c: maxCol } };

		const gradeRangeEncoded = XLSX.utils.encode_range(gradeRange); // Encoding converts from numbers to A1 notation
		const maxRangeEncoded = XLSX.utils.encode_range(maxRange);

		const func = { t: "n", z: "0.00%", f: `IFERROR(SUM(${gradeRangeEncoded})/SUM(${maxRangeEncoded}), "-")`, D: true };
		let totalRow = [null, null, "TOTAL", func]
		

		bodyRows.push(sectionInfo, ...assignmentRows, totalRow, []);
	});

	// Course grade calc
	const totalGradeFunc = { t: "n", z: "0.00%", f: `SUMPRODUCT(IF(ISNUMBER(_xlfn.FILTER(D:D, C:C="TOTAL")), _xlfn.FILTER(B:B,ISNUMBER(B:B)), 0)/SUM(IF(ISNUMBER(_xlfn.FILTER(D:D, C:C="TOTAL")), _xlfn.FILTER(B:B,ISNUMBER(B:B)), 0)), _xlfn.FILTER(D:D, C:C="TOTAL"))`, D: false };
	bodyRows[0].push(totalGradeFunc)
	
	const worksheet = XLSX.utils.aoa_to_sheet(bodyRows);
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

// DEBUG
// debugOutput()