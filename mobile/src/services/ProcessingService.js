/**
 * SmartPaste Mobile Processing Service
 * Handles content analysis and enrichment on mobile devices
 */

class ProcessingService {
  constructor() {
    this.handlers = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Initialize handlers based on platform capabilities
    await this.initializeHandlers();
    this.isInitialized = true;
  }

  async initializeHandlers() {
    // URL Handler
    this.handlers.set('url', {
      pattern: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      process: this.processUrl.bind(this)
    });

    // Email Handler
    this.handlers.set('email', {
      pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      process: this.processEmail.bind(this)
    });

    // Number Handler
    this.handlers.set('number', {
      pattern: /\d+(\.\d+)?\s*(°C|°F|kg|lbs|km|miles|L|gal|ft|m|cm|mm|in)/i,
      process: this.processNumber.bind(this)
    });

    // Code Handler
    this.handlers.set('code', {
      pattern: /(function|class|def|public|private|import|from|const|let|var)\s+/,
      process: this.processCode.bind(this)
    });

    // Math Handler
    this.handlers.set('math', {
      pattern: /[\d\+\-\*\/\(\)\^\.\s=]+/,
      process: this.processMath.bind(this)
    });
  }

  async processContent(content) {
    await this.initialize();

    const results = {
      original_content: content,
      enriched_content: content,
      detected_types: [],
      handlers: {}
    };

    // Detect content types and process with appropriate handlers
    for (const [type, handler] of this.handlers) {
      if (handler.pattern.test(content)) {
        try {
          const result = await handler.process(content);
          if (result) {
            results.detected_types.push(type);
            results.handlers[type] = result;
            
            // Update enriched content if handler provides enhancement
            if (result.enriched_content) {
              results.enriched_content = result.enriched_content;
            }
          }
        } catch (error) {
          console.error(`Error processing with ${type} handler:`, error);
        }
      }
    }

    // General text processing if no specific handler matched
    if (results.detected_types.length === 0) {
      const textResult = await this.processText(content);
      if (textResult) {
        results.detected_types.push('text');
        results.handlers.text = textResult;
      }
    }

    return results;
  }

  async processUrl(content) {
    const urlMatch = content.match(this.handlers.get('url').pattern);
    if (!urlMatch) return null;

    const url = urlMatch[0];
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'SmartPaste Mobile/1.0'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;
      
      // Extract meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : '';
      
      // Create enriched content
      const enrichedContent = `${title}\n${url}${description ? '\n' + description : ''}`;
      
      return {
        url,
        title,
        description,
        enriched_content: enrichedContent,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('URL processing error:', error);
      return {
        url,
        title: url,
        description: 'Failed to fetch page content',
        enriched_content: url,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async processEmail(content) {
    const emailMatch = content.match(this.handlers.get('email').pattern);
    if (!emailMatch) return null;

    const email = emailMatch[0];
    const [localPart, domain] = email.split('@');
    
    return {
      email,
      local_part: localPart,
      domain,
      is_valid: this.validateEmail(email),
      enriched_content: `Email: ${email}`,
      timestamp: Date.now()
    };
  }

  async processNumber(content) {
    const numberMatch = content.match(this.handlers.get('number').pattern);
    if (!numberMatch) return null;

    const fullMatch = numberMatch[0];
    const value = parseFloat(fullMatch);
    const unit = fullMatch.replace(/[\d\.\s]+/, '').toLowerCase();
    
    const conversions = this.getNumberConversions(value, unit);
    
    let enrichedContent = fullMatch;
    if (conversions.length > 0) {
      enrichedContent += '\nConversions:\n' + conversions.map(c => `• ${c}`).join('\n');
    }
    
    return {
      original_value: value,
      original_unit: unit,
      conversions,
      enriched_content: enrichedContent,
      timestamp: Date.now()
    };
  }

  async processCode(content) {
    const codeMatch = content.match(this.handlers.get('code').pattern);
    if (!codeMatch) return null;

    // Simple language detection
    let language = 'unknown';
    if (content.includes('function') || content.includes('const') || content.includes('let')) {
      language = 'javascript';
    } else if (content.includes('def ') || content.includes('import ')) {
      language = 'python';
    } else if (content.includes('public class') || content.includes('private ')) {
      language = 'java';
    }

    return {
      language,
      is_code: true,
      enriched_content: `Code (${language}):\n${content}`,
      timestamp: Date.now()
    };
  }

  async processMath(content) {
    // Simple math expression evaluation
    try {
      // Security: only allow basic math operations
      const sanitized = content.replace(/[^0-9+\-*/.() ]/g, '');
      if (sanitized !== content || !sanitized.trim()) {
        return null;
      }

      // Basic evaluation (in production, use a proper math parser)
      const result = Function('"use strict"; return (' + sanitized + ')')();
      
      if (typeof result === 'number' && isFinite(result)) {
        return {
          expression: content,
          result,
          enriched_content: `${content} = ${result}`,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      // Not a valid math expression
    }
    
    return null;
  }

  async processText(content) {
    if (content.length < 10) return null;

    return {
      word_count: content.split(/\s+/).length,
      character_count: content.length,
      is_text: true,
      enriched_content: content,
      timestamp: Date.now()
    };
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getNumberConversions(value, unit) {
    const conversions = [];

    switch (unit) {
      case '°c':
      case 'celsius':
        conversions.push(`${(value * 9/5 + 32).toFixed(1)}°F`);
        break;
      case '°f':
      case 'fahrenheit':
        conversions.push(`${((value - 32) * 5/9).toFixed(1)}°C`);
        break;
      case 'kg':
        conversions.push(`${(value * 2.20462).toFixed(2)} lbs`);
        break;
      case 'lbs':
        conversions.push(`${(value / 2.20462).toFixed(2)} kg`);
        break;
      case 'km':
        conversions.push(`${(value * 0.621371).toFixed(2)} miles`);
        break;
      case 'miles':
        conversions.push(`${(value * 1.60934).toFixed(2)} km`);
        break;
      case 'm':
        conversions.push(`${(value * 3.28084).toFixed(2)} ft`);
        break;
      case 'ft':
        conversions.push(`${(value / 3.28084).toFixed(2)} m`);
        break;
    }

    return conversions;
  }
}

export default new ProcessingService();