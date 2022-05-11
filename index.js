const submitButton = document.getElementById('submit-button')
const textArea = document.getElementById('paste')
submitButton.addEventListener('click', submit)

function submit() {
	const html = textArea.innerHTML
	console.log(html)
}