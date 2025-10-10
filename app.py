# importing the necessary tools from the flask framework
from flask import Flask, request, jsonify, send_file, render_template
from fpdf import FPDF
import io # Used to handle the PDF in memory
from flask_cors import CORS

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
        questions = data.get('questions', [])
        
        # Create the PDF object
        pdf = PDF()
        pdf.add_page()
        
        # Adding Unicode Font
        pdf.add_font('DejaVu', "", FONT_PATH) 
        pdf.add_font("DejaVu", "B", FONT_PATH) 
        
        # adding Title
        pdf.set_font('DejaVu', "B", 16) 
        # The 'C' argument centers the text
        pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(10) # Add a 10mm line break
        
        # Add instructions
        if instructions:
            pdf.set_font('DejaVu', '', 12) # Font: Arial, Regular, Size 12
            # Multi_cell handles text wrapping automatically
            pdf.multi_cell(0, 10, instructions)
            pdf.ln(10)
            
        # Add questions
        pdf.set_font('DejaVu', '', 12)
        for i, question in enumerate(questions, 1):
            # Format each question with a number
            question = question.replace("→", "->")
            question_text = f'{i}. {question}'
            pdf.multi_cell(0, 10, question_text)
            pdf.ln(5) # Add a small break after each question.
            
        # Generate the PDF in memory, Instead of saving to a file.
        pdf_bytes = pdf.output(dest='S')
        pdf_buffer = io.BytesIO(pdf_bytes)
        
        # Send the PDF back to the browser
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='exam.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Error occured: {e}")
        return jsonify({"error": "Failed to generate PDF"}), 500


# Entry point
if __name__ == "__main__":
    # The debug=True argument provides helpful error messages
    # and automatically reloads the server when you save changes.
    app.run(debug=True)