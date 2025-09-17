# SmartPaste Python Library

This directory contains the core SmartPaste functionality packaged as a Python library for easy installation and integration.

## 📦 Installation

```bash
# Basic installation
pip install smartpaste-core

# With NLP features
pip install smartpaste-core[nlp]

# With OCR features  
pip install smartpaste-core[ocr]

# Full installation
pip install smartpaste-core[all]
```

## 🚀 Quick Start

```python
from smartpaste import SmartPasteApp
from smartpaste.handlers import URLHandler, TextHandler

# Initialize the app
app = SmartPasteApp()

# Process clipboard content
result = app.process_clipboard()
print(result)

# Use individual handlers
url_handler = URLHandler()
text_handler = TextHandler()

# Process specific content
url_result = url_handler.process("https://example.com")
text_result = text_handler.process("Hello world!")
```

## 🔧 Configuration

```python
import yaml
from smartpaste import SmartPasteApp

# Load custom configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

app = SmartPasteApp(config=config)
```

## 📖 Features

- **Content Handlers**: URL, Text, Number, Image, Code, Email, Math
- **Async Processing**: Non-blocking content analysis
- **Caching System**: LRU cache with content hashing
- **Workflow Automation**: Rule-based content enrichment
- **Extensible**: Easy to add custom handlers

## 🔗 Integration Examples

### Web Application
```python
from flask import Flask, request, jsonify
from smartpaste import SmartPasteApp

app = Flask(__name__)
smartpaste = SmartPasteApp()

@app.route('/analyze', methods=['POST'])
def analyze_content():
    content = request.json.get('content')
    result = smartpaste.process_content(content)
    return jsonify(result)
```

### CLI Tool
```python
import click
from smartpaste import SmartPasteApp

@click.command()
@click.argument('content')
def analyze(content):
    app = SmartPasteApp()
    result = app.process_content(content)
    click.echo(result)

if __name__ == '__main__':
    analyze()
```

### Automation Script
```python
from smartpaste import SmartPasteApp
from smartpaste.utils import AutomationEngine

# Set up automated processing
app = SmartPasteApp()
automation = AutomationEngine(app)

# Add custom rule
automation.add_rule({
    'name': 'auto_summarize',
    'condition': 'content_type == "url"',
    'action': 'generate_summary',
    'enabled': True
})

# Process content with automation
result = automation.process_with_rules(content)
```

## 📚 Documentation

For detailed documentation, visit: https://smartpaste.ai/docs

## 🤝 Contributing

This library is part of the larger SmartPaste project. See the main repository for contribution guidelines.