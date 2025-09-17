"""
SmartPaste Core Library
Python package for intelligent clipboard content analysis
"""

from .main import SmartPasteApp
from .handlers import *
from .utils import *

__version__ = '1.0.0'
__author__ = 'SmartPaste Team'
__email__ = 'contact@smartpaste.ai'

__all__ = [
    'SmartPasteApp',
    'URLHandler',
    'TextHandler', 
    'NumberHandler',
    'ImageHandler',
    'CodeHandler',
    'EmailHandler',
    'MathHandler',
    'IOUtils',
    'NLPUtils',
    'TimeboxUtils',
    'CacheManager',
    'AsyncProcessor',
    'AutomationEngine',
]