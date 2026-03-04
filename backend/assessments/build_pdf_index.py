import os
import re
import argparse
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from pypdf import PdfReader

load_dotenv()

# ──────────────────────────────────────────────
# Assessment registry: code → (pdf_dir, index_dir)
# ──────────────────────────────────────────────
ASSESSMENT_REGISTRY = {
    "bigfive":  ("assessments/media/bigfive",   "assessments/media/bigfiveindex"),
    "disc":     ("assessments/media/disc",       "assessments/media/discindex"),
    "karasek":  ("assessments/media/karasek",    "assessments/media/karasekindex"),
    "maslach":  ("assessments/media/maslach",    "assessments/media/maslachindex"),
    "jss":      ("assessments/media/jss",        "assessments/media/jssindex"),
    "brs":      ("assessments/media/brs",        "assessments/media/brsindex"),
    "cdrisc":   ("assessments/media/cdrisc",     "assessments/media/cdriskindex"),
    "wses":     ("assessments/media/wses",       "assessments/media/wsesindex"),
    "gcos":     ("assessments/media/gcos",       "assessments/media/gcosindex"),
    "ribs":     ("assessments/media/ribs",       "assessments/media/ribsindex"),
    "caq":      ("assessments/media/caq",        "assessments/media/caqindex"),
    "ise":      ("assessments/media/ise",        "assessments/media/iseindex"),
}

# ──────────────────────────────────────────────
# Chunking configuration for each type of PDF.
# ──────────────────────────────────────────────


CHUNKING_CONFIG = {
    "standard": {"size": 1000, "overlap": 200},
    "academic": {"size": 1200, "overlap": 250},
    "manual": {"size": 1000, "overlap": 200},
}

MIN_PAGE_TEXT_LENGTH = 100
MIN_SECTION_TEXT_LENGTH = 150

# ──────────────────────────────────────────────
# Regex patterns — ACADEMIC PAPERS ONLY
# These are intentionally NOT applied to questionnaire/scale PDFs
# because patterns like bare digit lines or
# "No." / "Vol." could destroy Likert scale values and question text.
# ──────────────────────────────────────────────

# Matches "Page 12" / "- 12 -" style lines (explicit "Page N" only, not bare digits).
_ACADEMIC_PAGE_NUMBER_RE = re.compile(
    r"^\s*[-–]?\s*[Pp]age\s+\d+\s*[-–]?\s*$",
    re.MULTILINE,
)

# Matches typical journal/chapter/copyright header-footer lines.
_ACADEMIC_HEADER_FOOTER_RE = re.compile(
    r"^.{0,80}(Journal|Chapter|Copyright|©|All rights reserved|Published by|Vol\.|No\.|pp\.|Downloaded from).{0,80}$",
    re.MULTILINE | re.IGNORECASE,
)

# Detects start of a References/Bibliography section
# (fires only on an exact standalone heading line, not mid-paragraph text).
REFERENCES_SECTION_RE = re.compile(
    r"^\s*(?:\d+\.?\s*)?(?:References|Bibliography|REFERENCES|BIBLIOGRAPHY|Works Cited|Literature Cited)(?:\s+and\s+Notes)?\s*$",
    re.MULTILINE | re.IGNORECASE,
)

# Section headings for section-aware chunking of academic papers.
_SECTION_HEADING_RE = re.compile(
    r"^(?P<heading>"
    r"(?:Abstract|Introduction|Methods?|Results?|Discussion|Conclusions?|References?|Bibliography)"
    r"|(?:Extraversion|Agreeableness|Conscientiousness|Neuroticism|Openness(?:\s+to\s+Experience)?)"
    r"|(?:NEO|BFI|IPIP|Big\s*Five|OCEAN|DISC)"
    r"|(?:Dominance|Influence|Steadiness|Compliance|Latitude|Demande|Soutien|Burnout|Resilience)"
    r"|(?:Facets?\s+of\s+\w+)"
    r"|(?:\d{1,2}\.?\s+[A-Z][A-Za-z\s\n]{3,80})" # Catches "1. Introduction" or "3.1. Validity" with newlines
    r"|(?:[A-Z][A-Z\s\n]{4,80})"                 # Catches fully capitalized headers like "THE VALIDATION PROCESS"
    r")\s*$",
    re.MULTILINE | re.IGNORECASE,
)
# Patterns used to classify a section heading into one of three types:
#   trait_description  — OCEAN trait names, facet labels, instrument names
#   methodology        — methods, statistics, participants, results, discussion
#   general            — everything else (abstract, intro, conclusion prose, etc.)
_TRAIT_HEADING_RE = re.compile(
    r"(?:Extraversion|Agreeableness|Conscientiousness|Neuroticism|Openness"
    r"|Facets?|NEO|BFI|IPIP|Big\s*Five|OCEAN|Domain\s+\d+|DISC"
    r"|Dominance|Influence|Steadiness|Compliance|Latitude|Demande|Soutien|Burnout|Resilience"
    r"|Exhaustion|Depersonalization|Accomplishment|Autonomy|Control|Impersonal|Causality"
    r"|Creative|Creativity|Achievement|Stress|Strain|Behavior|Behaviour|Stigma|Cognitive"
    r"|Matrix|Matrices|Raven|Intelligence|Self-Esteem|Motivation|Orientation|Tension|Emotional"
    r"|Karasek|Maslach|GCOS|CD-RISC|BRS|CAQ|JSS|ISE|RIBS)",
    re.IGNORECASE,
)
_METHOD_HEADING_RE = re.compile(
    r"(?:Method|Result|Statistic|Measure|Instrument|Procedure|Abstract|Reference|Bibliography"
    r"|Participant|Sample|Data|Analys|Discussion|Conclusion|Introduction"
    r"|Study|Design|Reliability|Validity|Factor|Regression|Correlation|Scoring|Administration|Scoring\s+and\s+interpretation)",
    re.IGNORECASE,
)


def _classify_section(heading: str) -> str:
    """
    Return a coarse section type tag stored in chunk metadata.
    Used at retrieval time to filter out pure methodology/statistics chunks.
    """
    if _TRAIT_HEADING_RE.search(heading):
        return "trait_description"
    if _METHOD_HEADING_RE.search(heading):
        return "methodology"
    return "general"
# ──────────────────────────────────────────────
# Academic PDF detection
# Scans the first-page text for reliable markers unique to research papers.
# DOI is the strongest signal; HAL/arXiv IDs and Vol. patterns are fallback.
# Questionnaires/scales never carry these markers.
# ──────────────────────────────────────────────

_DOI_RE = re.compile(r'\b10\.\d{4,}/[^\s,;]+')
_HAL_ARXIV_RE = re.compile(r'\bhal-\d{6,}\b|\barXiv:\d{4}\.\d{4,}\b', re.IGNORECASE)
_JOURNAL_VOL_RE = re.compile(r'\bVol\.\s*\d+\b', re.IGNORECASE)
# Abstract heading near the top of the document
_ABSTRACT_RE = re.compile(r'\bAbstract\b')
# "et al." — appears only in academic in-text citations
_ET_AL_RE = re.compile(r'\bet\s+al\.\b', re.IGNORECASE)
# Peer-review submission/acceptance stamps (e.g. "Received 21 January 2000")
_RECEIVED_RE = re.compile(r'\b(?:Received|Accepted|Submitted)\b.*\d{4}', re.IGNORECASE)
# APA-style in-text citation: (Costa & McCrae, 1992) / (Sharpe, 2001)
_APA_CITATION_RE = re.compile(r'\([A-Z][a-z]+(?:[^)]*?\d{4})\)', re.IGNORECASE)
# Statistical significance markers (p < .05, p = .001, etc.)
_STATS_RE = re.compile(r'\bp\s*[<>=]\s*\.?\d+', re.IGNORECASE)


def is_academic_pdf(first_page_text: str) -> bool:
    """
    Returns True if the text looks like an academic research paper.
    Signals checked (any one match is sufficient):
      1. DOI prefix        – 10.xxxx/... (strongest)
      2. Repository ID     – hal-xxxxxx / arXiv:xxxx.xxxx
      3. Journal volume    – Vol. 12
      4. Abstract heading  – word "Abstract" near the top
      5. et al. citation   – exclusive to academic writing
      6. Peer-review stamp – "Received ... 2000"
      7. APA in-text cite  – (Author, Year)
      8. Statistics        – p < .05
    """
    if _DOI_RE.search(first_page_text):
        return True
    if _HAL_ARXIV_RE.search(first_page_text):
        return True
    if _JOURNAL_VOL_RE.search(first_page_text):
        return True
    if _ABSTRACT_RE.search(first_page_text):
        return True
    if _ET_AL_RE.search(first_page_text):
        return True
    if _RECEIVED_RE.search(first_page_text):
        return True
    if _APA_CITATION_RE.search(first_page_text):
        return True
    if _STATS_RE.search(first_page_text):
        return True
    return False


# ──────────────────────────────────────────────
# Text cleaning helpers
# ──────────────────────────────────────────────

def normalize_whitespace(text: str) -> str:
    """Safe for ALL PDF types. Only collapses excessive blank lines."""
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def clean_text_academic(text: str) -> str:
    """
    Aggressive cleaning for confirmed academic papers only.
    DO NOT call on questionnaire PDFs — it would corrupt their content.
    """
    text = _ACADEMIC_PAGE_NUMBER_RE.sub("", text)
    text = _ACADEMIC_HEADER_FOOTER_RE.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def strip_references_section(text: str) -> str:
    """Remove everything from the References / Bibliography heading onward."""
    match = REFERENCES_SECTION_RE.search(text)
    if match:
        text = text[: match.start()]
    return text.strip()


# ──────────────────────────────────────────────
# PDF loading (shared)
# ──────────────────────────────────────────────

# ──────────────────────────────────────────────
# Garbled-text detection & fallback decoder
# Some PDFs use Type 1 / Type 3 fonts with no ToUnicode CMap, so PyMuPDF
# returns control characters instead of readable text.  PyPDF's extractor
# outputs character names like "/C84" (decimal unicode code points) which
# we can decode trivially.  We use this as an automatic fallback.
# ──────────────────────────────────────────────

_CPDF_CHAR_RE = re.compile(r'/C(\d+)')


def _is_garbled_text(text: str) -> bool:
    """
    Returns True when PyMuPDF returned mostly control/private-use characters
    rather than readable Unicode text (ratio > 0.25 of all non-space chars).
    """
    if not text:
        return False
    non_space = [c for c in text if not c.isspace()]
    if not non_space:
        return False
    control_count = sum(1 for c in non_space if ord(c) < 32)
    return (control_count / len(non_space)) > 0.25


def _decode_cpdf_chars(text: str) -> str:
    """
    Convert PyPDF's "/C84" character-name notation to proper Unicode.
    E.g. "/C84/C104/C101" → "The"
    """
    return _CPDF_CHAR_RE.sub(lambda m: chr(int(m.group(1))), text)


def _load_pages_with_fallback(fpath: str, fname: str) -> tuple[list[Document], str]:
    """
    Try PyMuPDF directly using block extraction to preserve column layout.
    If the extracted text is garbled (broken CMap), fall back to pypdf + /Cxx decoding.
    Returns (list_of_page_Documents, loader_name_used).
    """
    pages = []
    try:
        import fitz
        doc = fitz.open(fpath)
        for page_num, page in enumerate(doc):
            # Using blocks with sort=True reads in natural reading order
            # which solves the multi-column text interleaving issue.
            blocks = page.get_text("blocks", sort=True)
            text_blocks = [b[4].strip() for b in blocks if b[6] == 0]
            pages.append(Document(
                page_content="\n\n".join(text_blocks),
                metadata={"file_name": fname, "page": page_num, "source": fpath}
            ))
        loader_name = "pymupdf_blocks"
    except Exception as e:
        print(f"PyMuPDF block extraction failed for {fname}: {e}")
        from langchain_community.document_loaders import PyMuPDFLoader
        loader = PyMuPDFLoader(fpath)
        pages = loader.load()
        for p in pages:
            p.metadata["file_name"] = fname
            p.metadata.setdefault("page", 0)
        loader_name = "pymupdf_fallback"
        loader_name = "pymupdf_fallback"

    # Check whether the first non-empty page looks garbled
    probe = next((p.page_content for p in pages if p.page_content.strip()), "")
    if not _is_garbled_text(probe):
        return pages, "pymupdf"

    # ── Fallback: pypdf + /Cxx decoding ──
    try:
        reader = PdfReader(fpath)
        fallback_pages: list[Document] = []
        for page_num, page in enumerate(reader.pages):
            raw = page.extract_text() or ""
            text = _decode_cpdf_chars(raw)
            fallback_pages.append(Document(
                page_content=text,
                metadata={"file_name": fname, "page": page_num, "source": fpath},
            ))
        return fallback_pages, "pypdf+decode"
    except Exception:
        # If pypdf also fails, return the original garbage-free pages
        return pages, "pymupdf(fallback-failed)"


def load_pdfs_with_pymupdf(pdf_dir: str) -> dict[str, list[Document]]:
    """
    Load all PDFs in a directory.
    Tries PyMuPDFLoader first; automatically falls back to pypdf + /Cxx
    decoding for PDFs with broken font CMap encodings.
    Returns a dict mapping filename → list of page Documents.
    """
    pdf_pages: dict[str, list[Document]] = {}
    for fname in sorted(os.listdir(pdf_dir)):
        if not fname.lower().endswith(".pdf"):
            continue
        fpath = os.path.join(pdf_dir, fname)
        try:
            pages, loader_used = _load_pages_with_fallback(fpath, fname)
            pdf_pages[fname] = pages
            note = f" (via {loader_used})" if loader_used != "pymupdf" else ""
            print(f"  ✅ Loaded '{fname}' — {len(pages)} pages{note}")
        except Exception as e:
            print(f"  ⚠️  Could not load '{fname}': {e}")
    return pdf_pages


# ──────────────────────────────────────────────
# Per-document chunking
# ──────────────────────────────────────────────

def _create_chunk_metadata(fname: str, section_title: str, page_num: int, assessment: str) -> dict:
    """Create metadata dictionary for a chunk."""
    return {
        "source_pdf": fname,
        "section_title": section_title,
        "section_type": _classify_section(section_title),
        "page_number": page_num,
        "assessment": assessment,
    }


def _extract_sections(text: str) -> list[tuple[str, str]]:
    """
    Extract sections from text using _SECTION_HEADING_RE.
    Returns list of (section_title, section_text) tuples.
    """
    heading_positions = [
        (m.start(), m.group("heading").strip())
        for m in _SECTION_HEADING_RE.finditer(text)
    ]

    if not heading_positions:
        return [("general", text)]

    sections = []
    pre = text[: heading_positions[0][0]].strip()
    if pre:
        sections.append(("general", pre))

    for i, (start_pos, heading) in enumerate(heading_positions):
        end_pos = (
            heading_positions[i + 1][0]
            if i + 1 < len(heading_positions)
            else len(text)
        )
        section_text = text[start_pos:end_pos].strip()
        if section_text:
            sections.append((heading, section_text))

    return sections


def _chunk_generic(
    pages: list[Document],
    fname: str,
    assessment: str,
    clean_fn,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
    section_aware: bool = True,
) -> list[Document]:
    """
    Generic section-aware chunking logic used by both manual and academic paths.
    
    Args:
        pages: List of page documents
        fname: PDF filename
        assessment: Assessment code
        clean_fn: Function to clean text (e.g., clean_text_academic or normalize_whitespace)
        chunk_size: Target chunk size in characters
        chunk_overlap: Overlap between chunks
        section_aware: Whether to split on section headings
    
    Returns:
        List of chunked documents with rich metadata
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    all_chunks: list[Document] = []
    in_references = False
    in_references = False

    for page_doc in pages:
        if in_references:
            continue
            
        page_num = page_doc.metadata.get("page", 0)
        text = clean_fn(page_doc.page_content)
        
        match = REFERENCES_SECTION_RE.search(text)
        if match:
            text = text[: match.start()]
            in_references = True
            
        text = text.strip()
        
        if len(text) < MIN_PAGE_TEXT_LENGTH:
            continue

        if not section_aware:
            # Simple splitter without section awareness
            sub_docs = splitter.create_documents(
                texts=[text],
                metadatas=[_create_chunk_metadata(fname, "general", page_num, assessment)],
            )
            all_chunks.extend(sub_docs)
        else:
            # Section-aware splitting
            sections = _extract_sections(text)
            
            for section_title, section_text in sections:
                if len(section_text.strip()) < MIN_SECTION_TEXT_LENGTH:
                    continue
                
                sub_docs = splitter.create_documents(
                    texts=[section_text],
                    metadatas=[_create_chunk_metadata(fname, section_title, page_num, assessment)],
                )
                all_chunks.extend(sub_docs)

    return all_chunks


def _chunk_standard(pages: list[Document], fname: str, assessment: str) -> list[Document]:
    """
    Simple chunking for non-academic PDFs (questionnaires, scales, manuals).
    Applies whitespace normalisation only. chunk_size=600, overlap=100.
    """
    return _chunk_generic(
        pages,
        fname,
        assessment,
        clean_fn=normalize_whitespace,
        chunk_size=CHUNKING_CONFIG["standard"]["size"],
        chunk_overlap=CHUNKING_CONFIG["standard"]["overlap"],
        section_aware=False,
    )


def _chunk_manual(pages: list[Document], fname: str, assessment: str) -> list[Document]:
    """
    Section-aware chunking for manuals and questionnaires.
    Uses normalize_whitespace. chunk_size=500, overlap=100.
    """
    return _chunk_generic(
        pages,
        fname,
        assessment,
        clean_fn=normalize_whitespace,
        chunk_size=CHUNKING_CONFIG["manual"]["size"],
        chunk_overlap=CHUNKING_CONFIG["manual"]["overlap"],
        section_aware=True,
    )


def _chunk_academic(pages: list[Document], fname: str, assessment: str) -> list[Document]:
    """
    Enhanced chunking for confirmed academic papers.
    Uses clean_text_academic to strip page numbers and journal headers.
    Section-aware split on headings, then fine splitting within each section.
    chunk_size=500, overlap=100.
    """
    return _chunk_generic(
        pages,
        fname,
        assessment,
        clean_fn=clean_text_academic,
        chunk_size=CHUNKING_CONFIG["academic"]["size"],
        chunk_overlap=CHUNKING_CONFIG["academic"]["overlap"],
        section_aware=True,
    )


# ──────────────────────────────────────────────
# Shared: embed & persist
# ──────────────────────────────────────────────

def _embed_and_save(chunks: list[Document], index_dir: str, api_key: str) -> None:
    print(f"\n🔗 Embedding {len(chunks)} chunks …")
    embeddings = OpenAIEmbeddings(api_key=api_key)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    os.makedirs(index_dir, exist_ok=True)
    vectorstore.save_local(index_dir)
    print(f"✅ Index saved to: {index_dir}")


# ──────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────

def build(assessment: str, api_key: str, method: str = "enhanced") -> None:
    """
    Build a FAISS index for the given assessment type.

    method="enhanced"  (default)
        Per-PDF academic detection via DOI / HAL / journal-volume patterns:
          • academic PDFs  → clean_text_academic + section-aware chunking (500 chars)
          • other PDFs     → normalize_whitespace + simple chunking (600 chars)

    method="classic"
        Mirrors the original build_pdf_index.py: PyMuPDFLoader (already an
        upgrade from old PyPDFLoader) + simple RecursiveCharacterTextSplitter,
        chunk_size=1000, overlap=200. No cleaning, no academic detection.
    """
    assessment = assessment.lower()
    if assessment not in ASSESSMENT_REGISTRY:
        raise ValueError(
            f"Unknown assessment '{assessment}'. "
            f"Valid options: {', '.join(ASSESSMENT_REGISTRY.keys())}"
        )

    pdf_dir, index_dir = ASSESSMENT_REGISTRY[assessment]

    if not os.path.isdir(pdf_dir):
        raise FileNotFoundError(f"PDF directory not found: {pdf_dir}")

    print(f"\n📂 Loading PDFs from: {pdf_dir}  [method={method}]")
    pdf_pages = load_pdfs_with_pymupdf(pdf_dir)

    if not pdf_pages:
        print("⚠️  No PDFs found. Aborting.")
        return

    if method == "classic":
        # ── Classic: simple splitter, no cleaning, no detection ──
        all_docs = [doc for pages in pdf_pages.values() for doc in pages]
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        chunks = splitter.split_documents(all_docs)
        print(f"  ℹ️  {len(chunks)} chunks created (classic)")

    else:
        # ── Enhanced: per-PDF academic detection ──
        chunks: list[Document] = []
        academic_count = 0
        standard_count = 0

        for fname, pages in pdf_pages.items():
            # Probe first two pages for academic markers
            probe_text = " ".join(p.page_content for p in pages[:2])
            academic = is_academic_pdf(probe_text)

            if academic:
                academic_count += 1
                print(f"  📄 '{fname}' → academic (cleaning + section-aware, 500-char chunks)")
                file_chunks = _chunk_academic(pages, fname, assessment)
            else:
                standard_count += 1
                print(f"  📄 '{fname}' → standard/manual (section-aware, 500-char chunks)")
                file_chunks = _chunk_manual(pages, fname, assessment)

            chunks.extend(file_chunks)

        print(
            f"\n  ℹ️  {len(chunks)} chunks total "
            f"({academic_count} academic PDFs, {standard_count} standard PDFs)"
        )

    if not chunks:
        print("⚠️  No chunks produced. Aborting.")
        return

    _embed_and_save(chunks, index_dir, api_key)


# ──────────────────────────────────────────────
# Direct script entry point
# ──────────────────────────────────────────────

# Usage: 
# Enhanced (auto-detects academic PDFs per file)
# python manage.py build_index --assessment bigfive
# python manage.py build_index --assessment bigfive --method enhanced

# # Classic (original simple behaviour)
# python manage.py build_index --assessment bigfive --method classic

if __name__ == "__main__":
    import django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    django.setup()

    from django.conf import settings as django_settings

    parser = argparse.ArgumentParser(
        description="Build FAISS vector index for a given assessment type."
    )
    parser.add_argument(
        "--assessment",
        required=True,
        choices=list(ASSESSMENT_REGISTRY.keys()),
        help="Assessment type to index (e.g. bigfive, disc, karasek …)",
    )
    parser.add_argument(
        "--method",
        choices=["enhanced", "classic"],
        default="enhanced",
        help=(
            "enhanced (default): per-PDF academic detection with section-aware chunking. "
            "classic: simple chunking mirroring the original build_pdf_index behaviour."
        ),
    )
    args = parser.parse_args()

    build(
        assessment=args.assessment,
        api_key=django_settings.OPENAI_API_KEY,
        method=args.method,
    )
