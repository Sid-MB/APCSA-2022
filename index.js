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
			sectionName: "",
			weight: 0,
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
	const sectionPercents = gradeColumn.filter((e) => e.includes("%"));
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
			gradebook.push({ sectionName: e.textContent, weight: sectionWeights[sectionIndex], assignments: [] });
			sectionIndex++;
		} else {
			const assignment = {
				title: e.childNodes[0].textContent,
				score: awardedGrades[assignIndex],
				outOf: outOfGrades[assignIndex],
			};
			gradebook[gradebook.length - 1].assignments.push(assignment);
			assignIndex++;
		}
	});

	console.log(gradebook);
}

function paste(event) {
	let paste = (event.clipboardData || window.clipboardData).getData("text/html");

	//console.log(paste);
	output.innerHTML = paste;

	submit();
}

// DEBUG
// debugOutput()