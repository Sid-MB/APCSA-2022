const submitButton = document.getElementById('submit-button')
const textArea = document.getElementById("paste");
const output = document.getElementById("output");

submitButton.addEventListener("click", submit);
textArea.addEventListener("paste", paste);

function submit() {
	let gradingPeriodName = output.querySelector(".td-content-wrapper > .title").childNodes[0];
	console.log(gradingPeriodName);

	// let categoryNames = output.querySelectorAll()

	// let assignmentNames = output.querySelectorAll(".title-column .title :not(.item-row, .visually-hidden)");
	// console.log(assignmentNames);

	let allLines = Array.from(output.querySelectorAll(".report-row"));
	let allTitles = allLines.map((e) => e.querySelector(".title").childNodes[0]);
	console.log(allTitles);

	let gradebook = [
		{
			sectionName: "",
			weight: 0,
			assignments: [
				{
					title: "",
					score: 0,
					outOf: 0
				},
			],
		},
	];

	//allTitles.shift()
	allTitles = allTitles.filter((t) => (t.textContent !== "(no grading period)"))
	allTitles.forEach((e) => {
		console.log(e)
		if (e.childNodes.length == 0) {
			gradebook.push({sectionName: e.textContent, assignments: []})
		} else {
			gradebook[gradebook.length - 1].assignments.push(e.childNodes[0].textContent);
		}
	});

	console.log(gradebook)
}

function paste(event) {
	let paste = (event.clipboardData || window.clipboardData).getData("text/html");

	//console.log(paste);
	output.innerHTML = paste;

	submit();
}