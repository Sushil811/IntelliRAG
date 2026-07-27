import pypdf
import docx
import io
import csv
import codecs
from typing import List, Dict, Any

def extract_pages_from_pdf(file_content: bytes) -> List[Dict[str, Any]]:
    pdf = pypdf.PdfReader(io.BytesIO(file_content))
    pages = []
    for idx, page in enumerate(pdf.pages):
        page_text = page.extract_text() or ""
        if page_text.strip():
            pages.append({
                "page_number": idx + 1,
                "text": page_text
            })
    return pages

def extract_text_from_pdf(file_content: bytes) -> str:
    pages = extract_pages_from_pdf(file_content)
    return "\n".join([p["text"] for p in pages])

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

def extract_pages(file_content: bytes, file_type: str) -> List[Dict[str, Any]]:
    file_type = file_type.lower()
    if file_type == "pdf":
        return extract_pages_from_pdf(file_content)
    else:
        raw_text = extract_text(file_content, file_type)
        if not raw_text.strip():
            return []
        return [{"page_number": 1, "text": raw_text}]

def extract_text(file_content: bytes, file_type: str) -> str:
    file_type = file_type.lower()
    if file_type == "pdf":
        return extract_text_from_pdf(file_content)
    elif file_type == "docx":
        return extract_text_from_docx(file_content)
    elif file_type == "csv":
        return extract_text_from_csv(file_content)
    elif file_type in ["txt", "md", "markdown"]:
        try:
            return file_content.decode("utf-8-sig")
        except UnicodeDecodeError:
            return file_content.decode("latin-1", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

