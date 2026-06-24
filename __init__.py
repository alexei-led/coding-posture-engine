"""Directory-plugin entrypoint for Hermes.

Hermes loads directory plugins from ``~/.hermes/plugins/<name>/__init__.py``
without necessarily adding the plugin root to ``sys.path``. Add it explicitly so
our bundled Python package imports the same way from a symlinked development
checkout, a cloned user plugin, or a packaged install. Tiny bit of sys.path
bureaucracy. Naturally.
"""
from __future__ import annotations

from pathlib import Path
import sys

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from coding_posture_engine.plugin import register

__all__ = ["register"]
