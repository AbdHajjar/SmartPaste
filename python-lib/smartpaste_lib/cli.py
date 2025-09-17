#!/usr/bin/env python3
"""
SmartPaste Library CLI Interface
Command-line tools for SmartPaste functionality
"""

import sys
import os
import click
import json
import yaml
from typing import Optional, Dict, Any
import pyperclip

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from smartpaste.main import SmartPaste
from smartpaste.handlers import URLHandler, TextHandler, NumberHandler
from smartpaste.utils.io import IOUtils
from smartpaste.utils.cache import CacheManager


@click.group()
@click.version_option(version='1.0.0')
def cli():
    """SmartPaste - Intelligent clipboard content analysis"""
    pass


@cli.command()
@click.option('--config', '-c', help='Configuration file path')
@click.option('--daemon', '-d', is_flag=True, help='Run as daemon')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def monitor(config: Optional[str], daemon: bool, verbose: bool):
    """Start clipboard monitoring"""
    click.echo("Starting SmartPaste clipboard monitor...")
    
    if config:
        if not os.path.exists(config):
            click.echo(f"Error: Config file not found: {config}", err=True)
            sys.exit(1)
    
    try:
        smartpaste = SmartPaste(config_path=config)
        
        if daemon:
            click.echo("Running in daemon mode...")
            smartpaste.start_daemon()
        else:
            click.echo("Press Ctrl+C to stop monitoring")
            smartpaste.start_monitoring()
            
    except KeyboardInterrupt:
        click.echo("\nStopping clipboard monitor...")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.argument('content', required=False)
@click.option('--file', '-f', help='Read content from file')
@click.option('--clipboard', '-c', is_flag=True, help='Process clipboard content')
@click.option('--output', '-o', help='Output file path')
@click.option('--format', '-F', type=click.Choice(['json', 'yaml', 'text']), default='json', help='Output format')
@click.option('--handler', '-h', help='Specific handler to use')
@click.option('--config', help='Configuration file path')
def process(content: Optional[str], file: Optional[str], clipboard: bool, output: Optional[str], 
           format: str, handler: Optional[str], config: Optional[str]):
    """Process content with SmartPaste handlers"""
    
    # Determine content source
    if clipboard:
        try:
            content = pyperclip.paste()
            if not content:
                click.echo("Error: Clipboard is empty", err=True)
                sys.exit(1)
        except Exception as e:
            click.echo(f"Error reading clipboard: {e}", err=True)
            sys.exit(1)
    elif file:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            click.echo(f"Error reading file: {e}", err=True)
            sys.exit(1)
    elif not content:
        content = click.get_text_stream('stdin').read()
    
    if not content.strip():
        click.echo("Error: No content to process", err=True)
        sys.exit(1)
    
    try:
        # Initialize SmartPaste
        smartpaste = SmartPaste(config_path=config)
        
        # Process content
        if handler:
            # Use specific handler
            result = smartpaste.process_with_handler(content, handler)
        else:
            # Use all applicable handlers
            result = smartpaste.process_content(content)
        
        # Format output
        if format == 'json':
            output_content = json.dumps(result, indent=2, ensure_ascii=False)
        elif format == 'yaml':
            output_content = yaml.dump(result, default_flow_style=False, allow_unicode=True)
        else:  # text
            output_content = format_text_output(result)
        
        # Write output
        if output:
            with open(output, 'w', encoding='utf-8') as f:
                f.write(output_content)
            click.echo(f"Output written to: {output}")
        else:
            click.echo(output_content)
            
    except Exception as e:
        click.echo(f"Error processing content: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--config', '-c', help='Configuration file path')
@click.option('--list-handlers', is_flag=True, help='List available handlers')
@click.option('--test', '-t', help='Test specific handler')
def info(config: Optional[str], list_handlers: bool, test: Optional[str]):
    """Show SmartPaste information and status"""
    
    try:
        smartpaste = SmartPaste(config_path=config)
        
        if list_handlers:
            click.echo("Available Handlers:")
            for name, handler in smartpaste.handlers.items():
                click.echo(f"  • {name}: {handler.__class__.__doc__ or 'No description'}")
        
        elif test:
            if test not in smartpaste.handlers:
                click.echo(f"Error: Handler '{test}' not found", err=True)
                sys.exit(1)
            
            click.echo(f"Testing handler: {test}")
            handler = smartpaste.handlers[test]
            
            # Test with sample content
            test_content = get_test_content(test)
            result = handler.process(test_content)
            
            click.echo(f"Test content: {test_content}")
            click.echo(f"Result: {json.dumps(result, indent=2)}")
        
        else:
            # Show general info
            click.echo("SmartPaste Information:")
            click.echo(f"  Version: 1.0.0")
            click.echo(f"  Config: {smartpaste.config_path or 'Default'}")
            click.echo(f"  Handlers: {len(smartpaste.handlers)}")
            click.echo(f"  Cache: {smartpaste.cache_manager.get_cache_size()} items")
            
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--clear', is_flag=True, help='Clear all cache')
@click.option('--size', is_flag=True, help='Show cache size')
@click.option('--stats', is_flag=True, help='Show cache statistics')
def cache(clear: bool, size: bool, stats: bool):
    """Manage SmartPaste cache"""
    
    try:
        cache_manager = CacheManager()
        
        if clear:
            cache_manager.clear_cache()
            click.echo("Cache cleared")
        
        elif size:
            size_info = cache_manager.get_cache_size()
            click.echo(f"Cache size: {size_info} items")
        
        elif stats:
            stats_info = cache_manager.get_cache_stats()
            click.echo("Cache Statistics:")
            for key, value in stats_info.items():
                click.echo(f"  {key}: {value}")
        
        else:
            # Show general cache info
            click.echo("Cache Information:")
            click.echo(f"  Location: {cache_manager.cache_dir}")
            click.echo(f"  Size: {cache_manager.get_cache_size()} items")
            
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--format', '-f', type=click.Choice(['json', 'yaml']), default='yaml', help='Config format')
@click.option('--output', '-o', help='Output file path')
def config_template(format: str, output: Optional[str]):
    """Generate configuration template"""
    
    template = {
        'clipboard': {
            'monitor_interval': 1.0,
            'auto_start': False
        },
        'handlers': {
            'url': {
                'enabled': True,
                'timeout': 10,
                'extract_metadata': True,
                'generate_summary': True
            },
            'text': {
                'enabled': True,
                'detect_language': True,
                'summarize': True,
                'min_length': 100
            },
            'number': {
                'enabled': True,
                'convert_temperature': True,
                'convert_length': True,
                'convert_weight': True
            }
        },
        'output': {
            'format': 'markdown',
            'include_original': True,
            'auto_save': False
        },
        'cache': {
            'enabled': True,
            'max_size': 100,
            'expire_after': 3600
        }
    }
    
    if format == 'json':
        content = json.dumps(template, indent=2)
    else:
        content = yaml.dump(template, default_flow_style=False)
    
    if output:
        with open(output, 'w', encoding='utf-8') as f:
            f.write(content)
        click.echo(f"Configuration template written to: {output}")
    else:
        click.echo(content)


def format_text_output(result: Dict[str, Any]) -> str:
    """Format result as human-readable text"""
    lines = []
    
    lines.append("SmartPaste Processing Result")
    lines.append("=" * 30)
    
    if 'original_content' in result:
        lines.append(f"Original: {result['original_content'][:100]}...")
    
    if 'enriched_content' in result:
        lines.append(f"Enriched: {result['enriched_content']}")
    
    if 'handlers' in result:
        lines.append("\nHandler Results:")
        for name, data in result['handlers'].items():
            lines.append(f"  {name.title()}:")
            for key, value in data.items():
                if key != 'enriched_content':
                    lines.append(f"    {key}: {value}")
    
    return '\n'.join(lines)


def get_test_content(handler_name: str) -> str:
    """Get test content for specific handler"""
    test_data = {
        'url': 'https://example.com',
        'text': 'This is a sample text for testing the text handler functionality.',
        'number': '25°C',
        'email': 'test@example.com',
        'code': 'def hello(): print("Hello, World!")',
        'image': 'sample_image.png'
    }
    
    return test_data.get(handler_name, 'Sample content for testing')


# Main entry points for console scripts
def main():
    """Main CLI entry point"""
    cli()


def monitor_entry():
    """Monitor entry point"""
    monitor.callback(None, False, False)


def process_content():
    """Process content entry point"""
    process.callback(None, None, True, None, 'json', None, None)


if __name__ == '__main__':
    main()