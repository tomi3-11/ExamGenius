// This event listener ensures our code runs only after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get references to our HTML elements ---
    const examTitleInput = document.getElementById('examTitle');
    const examInstructionsInput = document.getElementById('examInstructions');
    const newQuestionTextInput = document.getElementById('newQuestionText');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionList = document.getElementById('questionList');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateDocxBtn = document.getElementById('generateDocxBtn');

    // --- 2. Store questions in an array ---
    // This is a cleaner way to keep track of our questions.
    let questions = [];

    // --- 3. Handle adding a new question ---
    addQuestionBtn.addEventListener('click', () => {
        const questionText = newQuestionTextInput.value.trim(); // .trim() removes whitespace

        if (questionText) {
            // Add to our questions array
            questions.push(questionText);

            // Add to the list visible on the page
            const listItem = document.createElement('li');
            listItem.textContent = questionText;
            questionList.appendChild(listItem);

            // Clear the input field for the next question
            newQuestionTextInput.value = '';
        }
    });

    // --- 4. Handle the PDF generation ---
    generatePdfBtn.addEventListener('click', async () => {
        // Gather all the data into one object
        const examData = {
            title: examTitleInput.value,
            instructions: examInstructionsInput.value,
            questions: questions
        };

        try {
            // Use the Fetch API to send data to our Flask backend
            const response = await fetch('/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(examData),
            });

            if (!response.ok) {
                // If the server response is not OK, throw an error
                throw new Error(`Server responded with status: ${response.status}`);
            }

            // The server will send back the PDF as a 'blob'
            const blob = await response.blob();
            
            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element to trigger the download
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'exam.pdf'; // The default filename for the download
            document.body.appendChild(a);
            
            a.click(); // Simulate a click to start the download
            
            // Clean up by revoking the temporary URL
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate PDF. Check the console for more details.');
        }
    });

    // Handle the docx generation (NEW)
    generateDocxBtn.addEventListener('click', async () => {
        // Gather all the data into one object
        const examData = {
            title: examTitleInput.value,
            instructions: examInstructionsInput.value,
            questions: questions
        };

        try {
            // Use the Fetch API to send data to our NEW backend endpoint
            const response = await fetch('/generate-docx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(examData),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href. url;
            a.download = 'exam.docx';
            document.body.appendChild(a);

            a.click()

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate DOCX. Check the console for more details.')
        }
    })
});