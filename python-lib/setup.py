#!/usr/bin/env python3
"""
SmartPaste Python Library Setup
Core SmartPaste functionality as installable Python package
"""

from setuptools import setup, find_packages
import os
import sys

# Add parent directory to path to import version
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def read_file(filename):
    """Read content from file"""
    with open(os.path.join(os.path.dirname(__file__), filename), 'r', encoding='utf-8') as f:
        return f.read()

# Core dependencies for the library
CORE_DEPS = [
    'pyperclip>=1.8.2',
    'pyyaml>=6.0',
    'requests>=2.28.0',
    'beautifulsoup4>=4.11.0',
    'readability-lxml>=0.8.1',
]

# Optional dependencies for extended functionality
OPTIONAL_DEPS = {
    'nlp': [
        'langdetect>=1.0.9',
        'sentence-transformers>=2.2.0',
        'scikit-learn>=1.1.0',
    ],
    'ocr': [
        'pytesseract>=0.3.10',
        'pillow>=9.2.0',
    ],
    'all': [
        'langdetect>=1.0.9',
        'sentence-transformers>=2.2.0',
        'scikit-learn>=1.1.0',
        'pytesseract>=0.3.10',
        'pillow>=9.2.0',
    ]
}

setup(
    name='smartpaste-core',
    version='1.0.0',
    description='Intelligent clipboard content analysis and enrichment library',
    long_description=read_file('../README.md'),
    long_description_content_type='text/markdown',
    author='SmartPaste Team',
    author_email='contact@smartpaste.ai',
    url='https://github.com/AbdHajjar/SmartPaste',
    packages=find_packages(where='..', include=['smartpaste', 'smartpaste.*']),
    package_dir={'': '..'},
    include_package_data=True,
    install_requires=CORE_DEPS,
    extras_require=OPTIONAL_DEPS,
    python_requires='>=3.8',
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Utilities',
        'Topic :: Text Processing',
    ],
    keywords='clipboard, content-analysis, ai, automation, text-processing',
    entry_points={
        'console_scripts': [
            'smartpaste-core=smartpaste.main:main',
        ],
    },
    project_urls={
        'Documentation': 'https://smartpaste.ai/docs',
        'Source': 'https://github.com/AbdHajjar/SmartPaste',
        'Tracker': 'https://github.com/AbdHajjar/SmartPaste/issues',
    },
)