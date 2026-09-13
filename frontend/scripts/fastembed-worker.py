"""Private stdin/stdout embedding bridge. No web listener or provider credentials."""
import contextlib
import json
import os
import sys


def main():
    # Native/library diagnostics must never mix with the JSON protocol.
    with contextlib.redirect_stdout(sys.stderr):
        from fastembed import TextEmbedding
        from loguru import logger
        logger.remove()
        cache = os.environ.get("FASTEMBED_CACHE_PATH", ".integration-data/models")
        model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5", cache_dir=cache,
                              threads=2, local_files_only="--download" not in sys.argv)
        if "--download" in sys.argv:
            vectors = list(model.embed(["Model initialization check"]))
        else:
            request = json.loads(sys.stdin.read(131073))
            texts = request["texts"]
            if not isinstance(texts, list) or not 1 <= len(texts) <= 32:
                raise ValueError("Invalid batch")
            if any(not isinstance(t, str) or len(t) > 12000 for t in texts):
                raise ValueError("Invalid text")
            purpose = request.get("purpose", "passage")
            if purpose not in ("passage", "query"):
                raise ValueError("Invalid purpose")
            generator = model.query_embed(texts) if purpose == "query" else model.passage_embed(texts)
            vectors = list(generator)
    print(json.dumps({"vectors": [v.tolist() for v in vectors]}, allow_nan=False))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("FastEmbed unavailable; verify installation and initialize the model cache.", file=sys.stderr)
        sys.exit(1)
