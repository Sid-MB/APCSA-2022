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

	const sectionWeights = Array.from(output.querySelectorAll(".percentage-contrib")).map((e) => e.textContent.slice(1, e.textContent.length - 1));
	// Array.from(output.querySelectorAll("reportSpacer-2 > td-content-wrapper > percentage-contrib")).map((e) => e.textContent.slice(1, e.textContent.length - 2));
	// console.log(sectionWeights);

	let assignIndex = 0;
	let sectionIndex = 0;
	allTitles.forEach((e) => {
		// console.log(e);
		if (e.childNodes.length == 0) {
			gradebook.push({ name: e.textContent, weight: sectionWeights[sectionIndex], assignments: [] });
			sectionIndex++;
		} else {
			const assignment = {
				title: e.childNodes[0].textContent,
				score: (awardedGrades[assignIndex] == undefined ? "-" : awardedGrades[assignIndex]),
				outOf: (outOfGrades[assignIndex] == undefined ? "-" : outOfGrades[assignIndex]),
			};
			gradebook[gradebook.length - 1].assignments.push(assignment);
			assignIndex++;
		}
	});

	gradebook = gradebook.filter((section) => (section.weight != "0%" && section.name !== gradingPeriodName))

	console.log(gradebook);
	generateSpreadsheet(gradebook)
}

function generateSpreadsheet(gradebook) {
	const headerRow = document.createElement("tr");
	const headerTitles = ["Section", "Weight", "Assignment", "Grade", "Maximum"];
	headerTitles.forEach((text) => {
		const cell = document.createElement("th");
		cell.textContent = text;
		headerRow.appendChild(cell);
	});
	const bodyRows = [];

	gradebook.forEach((section) => {
		const sectionRow = document.createElement("tr");
		sectionRow.innerHTML = `<td>${section.name}</td>`;
		sectionRow.innerHTML += `<td>${section.weight}</td>`;
		const assignmentRows = [];
		section.assignments.forEach((a) => {
			const row = document.createElement("tr");
			row.innerHTML = `<td>&nbsp;</td><td>&nbsp;</td><td>${a.title}</td><td>${a.score}</td><td>${a.outOf}</td>`;
			assignmentRows.push(row);
		});

			let emptyRow = document.createElement("tr");
			emptyRow.innerHTML = "<td>&nbsp;</td>";
		bodyRows.push(sectionRow, ...assignmentRows, emptyRow);
	});
	const table = document.createElement("table");
	table.appendChild(headerRow);
	bodyRows.forEach((r) => table.appendChild(r));
	table.id = "gradebook-table";

	document.body.appendChild(table);

	let workbook = XLSX.utils.table_to_book(table);
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