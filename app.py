# importing the necessary tools from the flask framework
from flask import Flask, request, jsonify, send_file, render_template
from fpdf import FPDF
import io # Used to handle the PDF in memory
from flask_cors import CORS
from docx import Document
from docx.shared import Pt # To set font sizes
from docx.enum.text import WD_ALIGN_PARAGRAPH # to center text

# Create an instance of the Flask Application
app = Flask(__name__)
CORS(app)


# Custom PDF class using Unicode safe fonts
class PDF(FPDF):
    pass

# Register Unicode font
FONT_PATH = "fonts/DejaVuSans.ttf"

# Defining a route for the pdf application
# Route for the Homepage
@app.route('/')
def home():
    """Serves the main HTML page."""
    return render_template('index.html')

# PDF Generation Logic
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    """
    Receives exam data from the frontend, creates a pdf,
    and sends for download.
    """
    try:
        # Get the JSON data sent from the Frontend
        data = request.get_json()
        
        # Get the data from the JSON
        title = data.get('title', 'Exam Paper')
        instructions = data.get('instructions', '')
        questions = data.get('questions', []) # This is a list of objects
        
        # Create the PDF object
        # Assumes your custom PDF class 'PDF()' is defined elsewhere
        # If not, change this back to pdf = FPDF()
        pdf = FPDF() 
        pdf.add_page()
        
        # Adding Unicode Font (This assumes FONT_PATH is defined correctly)
        pdf.add_font('DejaVu', "", FONT_PATH) 
        pdf.add_font("DejaVu", "B", FONT_PATH) 
        
        # adding Title
        pdf.set_font('DejaVu', "B", 16) 
        # --- FIX for DeprecationWarning ---
        pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT", align='C')
        
        # Add instructions
        if instructions:
            pdf.set_font('DejaVu', '', 12)
            pdf.multi_cell(0, 10, instructions)
            pdf.ln(10)
            
        # Add questions
        pdf.set_font('DejaVu', '', 12)
        for i, question_data in enumerate(questions, 1):
            
            q_text = question_data.get('text', '').replace("→", "->")
            answer_lines = question_data.get('lines', 0)
            is_blank_only = question_data.get('blankOnly', False)
            
            pdf.multi_cell(0, 10, f'{i}. {q_text}')
            
            if answer_lines > 0:
                pdf.ln(5) 
                if not is_blank_only:
                    pdf.set_font('DejaVu', '', 11) 
                    pdf.cell(0, 10, "Answer:")
                    pdf.ln(5)
                
                pdf.set_font('DejaVu', '', 12)
                for _ in range(answer_lines):
                    # --- FIX for DeprecationWarning ---
                    pdf.cell(0, 10, "", border='B', new_x="LMARGIN", new_y="NEXT") 
                pdf.ln(7)
            else:
                pdf.ln(5)
            
        # --- CRASH FIX HERE ---
        # The 'dest' parameter is also deprecated, and we remove '.encode()'
        pdf_bytes = pdf.output() 
        pdf_buffer = io.BytesIO(pdf_bytes)
        
        # Send the PDF back to the browser
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='exam.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Error occured (PDF): {e}")
        return jsonify({"error": "Failed to generate PDF"}), 500


@app.route('/generate-docx', methods=['POST'])
def generate_docx():
    """
    Receives exam data, creates a DOCX, and sends it back for download.
    """
    try:
        data = request.get_json()
        
        title = data.get('title', 'Exam Paper')
        instructions = data.get('instructions', '')
        questions = data.get('questions', [])

        doc = Document()

        # --- SAFER METHOD for Title ---
        # 1. Add an empty paragraph and center it
        title_paragraph = doc.add_paragraph()
        title_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        # 2. Add the text as a 'run' to that paragraph
        title_run = title_paragraph.add_run(title)
        # 3. Style the run
        title_run.font.size = Pt(16)
        title_run.font.bold = True
        doc.add_paragraph() # Add space

        # --- Add Instructions ---
        if instructions:
            doc.add_paragraph(instructions)
            doc.add_paragraph()

        # --- Add Questions ---
        for i, question_data in enumerate(questions, 1):
            
            q_text = question_data.get('text', '')
            answer_lines = question_data.get('lines', 0)
            is_blank_only = question_data.get('blankOnly', False)
            
            doc.add_paragraph(f'{i}. {q_text}')

            if answer_lines > 0:
                if not is_blank_only:
                    # --- SAFER METHOD for "Answer:" prompt ---
                    # 1. Add an empty paragraph
                    answer_prompt_p = doc.add_paragraph()
                    # 2. Add the "Answer:" text as a run
                    answer_run = answer_prompt_p.add_run("Answer:")
                    # 3. Style the run
                    answer_run.font.italic = True
                
                line = "____________________________________________________________"
                for _ in range(answer_lines):
                    doc.add_paragraph(line)
                doc.add_paragraph()
            else:
                doc.add_paragraph()

        # --- Generate and Send the DOCX ---
        doc_buffer = io.BytesIO()
        doc.save(doc_buffer)
        doc_buffer.seek(0)

        return send_file(
            doc_buffer,
            as_attachment=True,
            download_name='exam.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

    except Exception as e:
        print(f"An error occurred (DOCX): {e}")
        return jsonify({"error": "Failed to generate DOCX"}), 500

# Entry point
if __name__ == "__main__":
    # The debug=True argument provides helpful error messages
    # and automatically reloads the server when you save changes.
    app.run(debug=True)