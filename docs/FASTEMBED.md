# Local FastEmbed setup

The server supports the official Python `fastembed==0.8.0` package with `BAAI/bge-small-en-v1.5`, 384 dimensions and Cosine retrieval. No embedding API key is required for this mode. OpenAI-compatible embedding support remains available.

From `frontend`, create a dedicated Python environment (Python 3.10+), install `scripts/requirements-fastembed.txt`, and set `FASTEMBED_PYTHON` to that environment's Python executable. Set `FASTEMBED_CACHE_PATH` to an absolute private cache directory. Initialize the public model once:

```sh
python scripts/fastembed-worker.py --download
```

Use the same Python executable and cache environment when initializing and running Next. Initialization prints a test vector; it is public test data, not a production count. Normal application calls use cached files only and do not download at request time. The Dockerfile prepares Python and the cache during the build; the container build is still unverified locally because Docker was unavailable.

```dotenv
EMBEDDING_PROVIDER=fastembed
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
EMBEDDING_DIMENSION=384
FASTEMBED_PYTHON=
FASTEMBED_CACHE_PATH=
```

The application uses passage/query embedding methods, validates batch size and every vector, serializes inference, and kills the worker after 45 seconds. The child does not inherit Omi/Qdrant/Lyzr keys or session credentials. It exposes no listening network service. Concurrent inference returns an explicit busy response; benchmark capacity and memory on Render before release.

A real local smoke test generated two 384-dimensional passage vectors and one query vector; the relevant pump passage ranked above an unrelated menu passage. This is not the judge-set retrieval-quality evaluation or Qdrant verification. Five mocked worker protocol/failure tests also pass.

Changing embedding model or payload policy requires the versioned migration and retrieval evaluation before activation. Existing payloads need `organization_id` and `plant_id` in addition to tenant/plant; payload-v2 checkpoints ensure reindexing is not skipped.

Reference: [Qdrant FastEmbed documentation](https://qdrant.github.io/fastembed/Getting%20Started/).
