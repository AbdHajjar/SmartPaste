"""
Content handlers for different clipboard data types.

This package contains specialized handlers for:
- URLs (title extraction, summarization, keyword generation)
- Numbers with units (automatic conversion)
- General text (language detection, summarization)
- Images (OCR text extraction)
"""

from .url import URLHandler
from .number import NumberHandler
from .text import TextHandler
from .image import ImageHandler

__all__ = ["URLHandler", "NumberHandler", "TextHandler", "ImageHandler"]