// This event listener ensures our code runs only after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get references to our HTML elements ---
    const examTitleInput = document.getElementById('examTitle');
    const examInstructionsInput = document.getElementById('examInstructions');
    const newQuestionTextInput = document.getElementById('newQuestionText');
    const answerLinesInput = document.getElementById('answerLines');
    const blankLinesOnlyCheckbox = document.getElementById('blankLinesOnly');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionList = document.getElementById('questionList');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateDocxBtn = document.getElementById('generateDocxBtn');

    // --- 2. Store questions in an array ---
    let questions = [];

    // --- 3. Handle adding a new question (CORRECTED LOGIC) ---
    addQuestionBtn.addEventListener('click', () => {
        const questionText = newQuestionTextInput.value.trim();
        const lines = parseInt(answerLinesInput.value, 10);
        const isBlank = blankLinesOnlyCheckbox.checked;

        if (questionText) {
            // Create a question OBJECT
            const questionData = {
                text: questionText,
                lines: lines,
                blankOnly: isBlank,
            };

            // Push the object, not just the text
            questions.push(questionData);

            // Update the display list to be more descriptive
            const listItem = document.createElement('li');
            let displayText = questionData.text;
            if (questionData.lines > 0) {
                displayText += ` (${questionData.lines} answer lines)`;
            }
            listItem.textContent = displayText;
            questionList.appendChild(listItem);

            // Clear the input field for the next question
            newQuestionTextInput.value = '';
        }
    });

    // --- 4. Handle the PDF generation ---
    generatePdfBtn.addEventListener('click', async () => {
        const examData = {
            title: examTitleInput.value,
            instructions: examInstructionsInput.value,
            questions: questions // This will now send the array of objects
        };

        try {
            const response = await fetch('/generate-pdf', {
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
            a.href = url;
            a.download = 'exam.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate PDF. Check the console for more details.');
        }
    });

    // --- 5. Handle the docx generation ---
    generateDocxBtn.addEventListener('click', async () => {
        const examData = {
            title: examTitleInput.value,
            instructions: examInstructionsInput.value,
            questions: questions
        };

        try {
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
            
            a.href = url;
            a.download = 'exam.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate DOCX. Check the console for more details.');
        }
    });
});