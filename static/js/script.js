// This event listener ensures our code runs only after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    const examTitleInput = document.getElementById('examTitle');
    const examInstructionsInput = document.getElementById('examInstructions');
    const questionList = document.getElementById('questionList');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateDocxBtn = document.getElementById('generateDocxBtn');

    const newQuestionTextInput = document.getElementById('newQuestionText');
    const answerLinesInput = document.getElementById('answerLines');
    const blankLinesOnlyCheckbox = document.getElementById('blankLinesOnly');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    
    const questionTypeSelect = document.getElementById('questionType');
    const formShortAnswer = document.getElementById('form-short-answer');
    const formMcq = document.getElementById('form-mcq');

    const mcqQuestionText = document.getElementById('mcqQuestionText');
    const mcqOptionText = document.getElementById('mcqOptionText');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const mcqOptionsList = document.getElementById('mcqOptionsList');
    const addMcqQuestionBtn = document.getElementById('addMcqQuestionBtn');

    let questions = [];
    let currentMcqOptions = []; 

    questionTypeSelect.addEventListener('change', () => {
        if (questionTypeSelect.value === 'short_answer') {
            formShortAnswer.style.display = 'block';
            formMcq.style.display = 'none';
        } else {
            formShortAnswer.style.display = 'none';
            formMcq.style.display = 'block';
        }
    });

    addOptionBtn.addEventListener('click', () => {
        const optionText = mcqOptionText.value.trim();
        if (optionText) {
            currentMcqOptions.push(optionText);
            
            const listItem = document.createElement('li');
            listItem.textContent = optionText;
            mcqOptionsList.appendChild(listItem);

            mcqOptionText.value = ''; 
        }
    });

    addQuestionBtn.addEventListener('click', () => {
        const questionText = newQuestionTextInput.value.trim();
        const lines = parseInt(answerLinesInput.value, 10);
        const isBlank = blankLinesOnlyCheckbox.checked;

        if (questionText) {
            const questionData = {
                type: 'short_answer', 
                text: questionText,
                lines: lines,
                blankOnly: isBlank,
            };

            questions.push(questionData);

            const listItem = document.createElement('li');
            let displayText = questionData.text;
            if (questionData.lines > 0) {
                displayText += ` (${questionData.lines} answer lines)`;
            }
            listItem.textContent = displayText;
            questionList.appendChild(listItem);

            newQuestionTextInput.value = '';
        }
    });

    addMcqQuestionBtn.addEventListener('click', () => {
        const questionText = mcqQuestionText.value.trim();

        if (questionText && currentMcqOptions.length > 0) {
            const questionData = {
                type: 'mcq', 
                text: questionText,
                options: [...currentMcqOptions] 
            };

            questions.push(questionData);
            
            const mainListItem = document.createElement('li');
            mainListItem.textContent = `${questionData.text} (Multiple Choice)`;
            questionList.appendChild(mainListItem);

            mcqQuestionText.value = '';
            mcqOptionsList.innerHTML = ''; 
            currentMcqOptions = []; 

        } else if (!questionText) {
            alert('Please enter the question text.');
        } else {
            alert('Please add at least one option to the question.');
        }
    });

    generatePdfBtn.addEventListener('click', async () => {
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

    generateDocxBtn.addEventListener('click', async () => {
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