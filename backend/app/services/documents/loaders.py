import pypdf
import docx
import io
import csv
import codecs

def extract_text_from_pdf(file_content: bytes) -> str:
    pdf = pypdf.PdfReader(io.BytesIO(file_content))
    text = ""
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_content))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_text_from_csv(file_content: bytes) -> str:
    reader = csv.reader(codecs.iterdecode(io.BytesIO(file_content), 'utf-8'))
    text = ""
    for row in reader:
        text += ", ".join(row) + "\n"
    return text

def extract_text(file_content: bytes, file_type: str) -> str:
    file_type = file_type.lower()
    if file_type == "pdf":
        return extract_text_from_pdf(file_content)
    elif file_type == "docx":
        return extract_text_from_docx(file_content)
    elif file_type == "csv":
        return extract_text_from_csv(file_content)
    elif file_type in ["txt", "md", "markdown"]:
        return file_content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
