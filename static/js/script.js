// This event listener ensures our code runs only after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get references to ALL our HTML elements ---
    const examTitleInput = document.getElementById('examTitle');
    const examInstructionsInput = document.getElementById('examInstructions');
    const questionList = document.getElementById('questionList');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateDocxBtn = document.getElementById('generateDocxBtn');

    // --- Short Answer (Original) Elements ---
    const newQuestionTextInput = document.getElementById('newQuestionText');
    const answerLinesInput = document.getElementById('answerLines');
    const blankLinesOnlyCheckbox = document.getElementById('blankLinesOnly');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    
    // --- NEW: Question Type Elements ---
    const questionTypeSelect = document.getElementById('questionType');
    const formShortAnswer = document.getElementById('form-short-answer');
    const formMcq = document.getElementById('form-mcq');

    // --- NEW: MCQ Form Elements ---
    const mcqQuestionText = document.getElementById('mcqQuestionText');
    const mcqOptionText = document.getElementById('mcqOptionText');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const mcqOptionsList = document.getElementById('mcqOptionsList');
    const addMcqQuestionBtn = document.getElementById('addMcqQuestionBtn');

    // --- 2. Store questions in an array ---
    let questions = [];
    let currentMcqOptions = []; // NEW: Temporary storage for MCQ options

    // --- NEW: 3. Handle changing the question type ---
    questionTypeSelect.addEventListener('change', () => {
        if (questionTypeSelect.value === 'short_answer') {
            formShortAnswer.style.display = 'block';
            formMcq.style.display = 'none';
        } else {
            formShortAnswer.style.display = 'none';
            formMcq.style.display = 'block';
        }
    });

    // --- NEW: 4. Handle adding an option to the temporary MCQ list ---
    addOptionBtn.addEventListener('click', () => {
        const optionText = mcqOptionText.value.trim();
        if (optionText) {
            currentMcqOptions.push(optionText);
            
            // Add to the visual list on the page
            const listItem = document.createElement('li');
            listItem.textContent = optionText;
            mcqOptionsList.appendChild(listItem);

            mcqOptionText.value = ''; // Clear the input
        }
    });

    // --- 5. Handle adding a "Short Answer" question (Slightly MODIFIED) ---
    addQuestionBtn.addEventListener('click', () => {
        const questionText = newQuestionTextInput.value.trim();
        const lines = parseInt(answerLinesInput.value, 10);
        const isBlank = blankLinesOnlyCheckbox.checked;

        if (questionText) {
            // Create a question OBJECT
            const questionData = {
                type: 'short_answer', // <-- THIS IS THE REQUIRED CHANGE
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

    // --- NEW: 6. Handle adding the "Multiple Choice" question ---
    addMcqQuestionBtn.addEventListener('click', () => {
        const questionText = mcqQuestionText.value.trim();

        if (questionText && currentMcqOptions.length > 0) {
            const questionData = {
                type: 'mcq', // Add the type
                text: questionText,
                options: [...currentMcqOptions] // Copy the options array
            };

            questions.push(questionData);
            
            // Add to the main exam question list
            const mainListItem = document.createElement('li');
            mainListItem.textContent = `${questionData.text} (Multiple Choice)`;
            questionList.appendChild(mainListItem);

            // --- Reset the MCQ form for the next question ---
            mcqQuestionText.value = '';
            mcqOptionsList.innerHTML = ''; // Clear the visual list
            currentMcqOptions = []; // Clear the temporary options array

        } else if (!questionText) {
            alert('Please enter the question text.');
        } else {
            alert('Please add at least one option to the question.');
        }
    });

    // --- 7. Handle the PDF generation (Slightly MODIFIED) ---
    generatePdfBtn.addEventListener('click', async () => {
        // NEW: Add validation
        if (questions.length === 0) {
            alert("Please add at least one question.");
            return;
        }

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

    // --- 8. Handle the docx generation (Slightly MODIFIED) ---
    generateDocxBtn.addEventListener('click', async () => {
        // NEW: Add validation
        if (questions.length === 0) {
            alert("Please add at least one question.");
            return;
        }
        
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