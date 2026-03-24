from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from pathlib import Path
from dotenv import load_dotenv
import os


class Command(BaseCommand):
    help = (
        "Build a FAISS vector index for a given assessment type. "
        "Uses PyMuPDFLoader and automatically detects academic vs. "
        "questionnaire PDFs when method=enhanced (the default)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--assessment",
            type=str,
            required=True,
            metavar="TYPE",
            help=(
                "Assessment type to index. "
                "Choices: bigfive, disc, karasek, maslach, jss, brs, "
                "cdrisc, wses, gcos, ribs, caq, ise"
            ),
        )
        parser.add_argument(
            "--method",
            type=str,
            choices=["enhanced", "classic"],
            default="enhanced",
            help=(
                "enhanced (default): per-PDF academic detection — academic PDFs get "
                "section-aware chunking (500 chars), others get simple chunking (600 chars). "
                "classic: mirrors original behaviour, chunk_size=1000, no cleaning."
            ),
        )

    def handle(self, *args, **options):
        # Import here to avoid circular imports at startup
        from assessments.build_pdf_index import build, ASSESSMENT_REGISTRY

        assessment = options["assessment"].lower()
        method = options["method"]

        if assessment not in ASSESSMENT_REGISTRY:
            raise CommandError(
                f"Unknown assessment '{assessment}'. "
                f"Valid options: {', '.join(ASSESSMENT_REGISTRY.keys())}"
            )

        api_key = getattr(settings, "OPENAI_API_KEY", None)

        # Fallback: try to load .env from project BASE_DIR if settings didn't pick it up
        if not api_key:
            # settings.BASE_DIR is a Path in this project; fall back to project layout
            try:
                base = getattr(settings, "BASE_DIR", None)
                if base:
                    env_path = Path(base) / ".env"
                    if env_path.exists():
                        load_dotenv(env_path)
                # also try repository root ../.env as a last resort
                repo_env = Path(__file__).resolve().parents[4] / ".env"
                if repo_env.exists():
                    load_dotenv(repo_env)
            except Exception:
                pass

            api_key = os.environ.get("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", None)

        if not api_key:
            raise CommandError(
                "OPENAI_API_KEY is not set in Django settings or the .env file."
            )

        self.stdout.write(
            self.style.NOTICE(
                f"🚀 Building index  assessment='{assessment}'  method='{method}' …"
            )
        )

        try:
            build(assessment=assessment, api_key=api_key, method=method)
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Index for '{assessment}' built successfully."
                )
            )
        except FileNotFoundError as e:
            raise CommandError(str(e))
        except Exception as e:
            raise CommandError(f"Failed to build index: {e}")
