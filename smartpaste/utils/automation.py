"""
Smart Workflow Automation System for SmartPaste AI

Provides intelligent automation, custom rules, and workflow management based on content patterns.
"""

import re
import json
import time
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Callable, Union, Pattern
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import threading


class ActionType(Enum):
    """Types of automated actions."""
    COPY_TO_CLIPBOARD = "copy_to_clipboard"
    SAVE_TO_FILE = "save_to_file"
    APPEND_TO_FILE = "append_to_file"
    EXECUTE_COMMAND = "execute_command"
    SEND_NOTIFICATION = "send_notification"
    TRANSFORM_CONTENT = "transform_content"
    TRIGGER_WEBHOOK = "trigger_webhook"
    OPEN_URL = "open_url"
    CREATE_TODO = "create_todo"
    SEND_EMAIL = "send_email"


class ConditionType(Enum):
    """Types of rule conditions."""
    CONTENT_MATCHES = "content_matches"
    CONTENT_CONTAINS = "content_contains"
    CONTENT_TYPE = "content_type"
    CONTENT_LENGTH = "content_length"
    TIME_RANGE = "time_range"
    DAY_OF_WEEK = "day_of_week"
    FREQUENCY = "frequency"
    PATTERN_REGEX = "pattern_regex"
    SOURCE_APPLICATION = "source_application"
    USER_DEFINED = "user_defined"


@dataclass
class Condition:
    """Represents a rule condition."""
    type: ConditionType
    value: Any
    operator: str = "equals"  # equals, contains, matches, greater_than, less_than, etc.
    case_sensitive: bool = False
    
    def evaluate(self, context: Dict[str, Any]) -> bool:
        """Evaluate the condition against the given context."""
        try:
            if self.type == ConditionType.CONTENT_CONTAINS:
                content = context.get('content', '').lower()
                value = str(self.value).lower() if not self.case_sensitive else str(self.value)
                return value in content
            
            elif self.type == ConditionType.CONTENT_MATCHES:
                content = context.get('content', '')
                if self.case_sensitive:
                    return content == str(self.value)
                return content.lower() == str(self.value).lower()
            
            elif self.type == ConditionType.CONTENT_TYPE:
                return context.get('content_type') == self.value
            
            elif self.type == ConditionType.CONTENT_LENGTH:
                content_length = len(context.get('content', ''))
                if self.operator == "greater_than":
                    return content_length > self.value
                elif self.operator == "less_than":
                    return content_length < self.value
                else:
                    return content_length == self.value
            
            elif self.type == ConditionType.PATTERN_REGEX:
                content = context.get('content', '')
                flags = 0 if self.case_sensitive else re.IGNORECASE
                return bool(re.search(self.value, content, flags))
            
            elif self.type == ConditionType.TIME_RANGE:
                current_time = datetime.now().time()
                start_time, end_time = self.value
                return start_time <= current_time <= end_time
            
            elif self.type == ConditionType.DAY_OF_WEEK:
                current_day = datetime.now().weekday()  # 0=Monday, 6=Sunday
                return current_day in self.value if isinstance(self.value, list) else current_day == self.value
            
            elif self.type == ConditionType.SOURCE_APPLICATION:
                return context.get('source_app') == self.value
            
            return False
            
        except Exception as e:
            logging.getLogger(__name__).error(f"Error evaluating condition: {e}")
            return False


@dataclass
class Action:
    """Represents a rule action."""
    type: ActionType
    parameters: Dict[str, Any] = field(default_factory=dict)
    delay_seconds: float = 0.0
    enabled: bool = True
    
    def execute(self, context: Dict[str, Any]) -> bool:
        """Execute the action with the given context."""
        if not self.enabled:
            return True
        
        try:
            if self.delay_seconds > 0:
                time.sleep(self.delay_seconds)
            
            if self.type == ActionType.COPY_TO_CLIPBOARD:
                return self._copy_to_clipboard(context)
            
            elif self.type == ActionType.SAVE_TO_FILE:
                return self._save_to_file(context)
            
            elif self.type == ActionType.APPEND_TO_FILE:
                return self._append_to_file(context)
            
            elif self.type == ActionType.SEND_NOTIFICATION:
                return self._send_notification(context)
            
            elif self.type == ActionType.TRANSFORM_CONTENT:
                return self._transform_content(context)
            
            elif self.type == ActionType.OPEN_URL:
                return self._open_url(context)
            
            elif self.type == ActionType.CREATE_TODO:
                return self._create_todo(context)
            
            # Add more action implementations as needed
            return True
            
        except Exception as e:
            logging.getLogger(__name__).error(f"Error executing action {self.type}: {e}")
            return False
    
    def _copy_to_clipboard(self, context: Dict[str, Any]) -> bool:
        """Copy content to clipboard."""
        try:
            import pyperclip
            content = self.parameters.get('content', context.get('content', ''))
            # Apply template substitution
            content = self._apply_template(content, context)
            pyperclip.copy(content)
            return True
        except ImportError:
            logging.getLogger(__name__).error("pyperclip not available for clipboard operation")
            return False
    
    def _save_to_file(self, context: Dict[str, Any]) -> bool:
        """Save content to file."""
        try:
            file_path = Path(self.parameters.get('file_path', 'smartpaste_output.txt'))
            content = self.parameters.get('content', context.get('content', ''))
            content = self._apply_template(content, context)
            
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            logging.getLogger(__name__).error(f"Error saving to file: {e}")
            return False
    
    def _append_to_file(self, context: Dict[str, Any]) -> bool:
        """Append content to file."""
        try:
            file_path = Path(self.parameters.get('file_path', 'smartpaste_log.txt'))
            content = self.parameters.get('content', context.get('content', ''))
            content = self._apply_template(content, context)
            
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, 'a', encoding='utf-8') as f:
                f.write(content + '\\n')
            return True
        except Exception as e:
            logging.getLogger(__name__).error(f"Error appending to file: {e}")
            return False
    
    def _send_notification(self, context: Dict[str, Any]) -> bool:
        """Send system notification."""
        try:
            title = self.parameters.get('title', 'SmartPaste AI')
            message = self.parameters.get('message', 'Content processed')
            message = self._apply_template(message, context)
            
            # Try to use Windows toast notifications
            try:
                from plyer import notification
                notification.notify(
                    title=title,
                    message=message,
                    timeout=self.parameters.get('timeout', 5)
                )
                return True
            except ImportError:
                # Fallback to print for now
                print(f"📢 {title}: {message}")
                return True
        except Exception as e:
            logging.getLogger(__name__).error(f"Error sending notification: {e}")
            return False
    
    def _transform_content(self, context: Dict[str, Any]) -> bool:
        """Transform content using specified rules."""
        try:
            transformation = self.parameters.get('transformation', 'uppercase')
            content = context.get('content', '')
            
            if transformation == 'uppercase':
                transformed = content.upper()
            elif transformation == 'lowercase':
                transformed = content.lower()
            elif transformation == 'title_case':
                transformed = content.title()
            elif transformation == 'remove_whitespace':
                transformed = re.sub(r'\\s+', ' ', content).strip()
            elif transformation == 'extract_urls':
                url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
                transformed = '\\n'.join(re.findall(url_pattern, content))
            elif transformation == 'extract_emails':
                email_pattern = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
                transformed = '\\n'.join(re.findall(email_pattern, content))
            else:
                # Custom regex transformation
                if 'regex_pattern' in self.parameters and 'replacement' in self.parameters:
                    pattern = self.parameters['regex_pattern']
                    replacement = self.parameters['replacement']
                    transformed = re.sub(pattern, replacement, content)
                else:
                    transformed = content
            
            # Update context with transformed content
            context['transformed_content'] = transformed
            return True
            
        except Exception as e:
            logging.getLogger(__name__).error(f"Error transforming content: {e}")
            return False
    
    def _open_url(self, context: Dict[str, Any]) -> bool:
        """Open URL in browser."""
        try:
            import webbrowser
            url = self.parameters.get('url', context.get('content', ''))
            url = self._apply_template(url, context)
            webbrowser.open(url)
            return True
        except Exception as e:
            logging.getLogger(__name__).error(f"Error opening URL: {e}")
            return False
    
    def _create_todo(self, context: Dict[str, Any]) -> bool:
        """Create a todo item."""
        try:
            todo_text = self.parameters.get('text', context.get('content', ''))
            todo_text = self._apply_template(todo_text, context)
            
            # Save to a simple todo file
            todo_file = Path(self.parameters.get('todo_file', 'smartpaste_todos.txt'))
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            todo_file.parent.mkdir(parents=True, exist_ok=True)
            with open(todo_file, 'a', encoding='utf-8') as f:
                f.write(f"[{timestamp}] TODO: {todo_text}\\n")
            
            return True
        except Exception as e:
            logging.getLogger(__name__).error(f"Error creating todo: {e}")
            return False
    
    def _apply_template(self, template: str, context: Dict[str, Any]) -> str:
        """Apply template substitution to text."""
        try:
            # Simple template substitution
            for key, value in context.items():
                placeholder = f"{{{key}}}"
                if placeholder in template:
                    template = template.replace(placeholder, str(value))
            
            # Add timestamp placeholders
            now = datetime.now()
            template = template.replace('{timestamp}', now.strftime('%Y-%m-%d %H:%M:%S'))
            template = template.replace('{date}', now.strftime('%Y-%m-%d'))
            template = template.replace('{time}', now.strftime('%H:%M:%S'))
            
            return template
        except Exception:
            return template


@dataclass
class Rule:
    """Represents an automation rule."""
    id: str
    name: str
    description: str
    conditions: List[Condition]
    actions: List[Action]
    enabled: bool = True
    priority: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    last_triggered: Optional[datetime] = None
    trigger_count: int = 0
    cooldown_seconds: float = 0.0
    max_triggers_per_hour: Optional[int] = None
    
    def should_trigger(self, context: Dict[str, Any]) -> bool:
        """Check if rule should trigger based on conditions and constraints."""
        if not self.enabled:
            return False
        
        # Check cooldown
        if self.last_triggered and self.cooldown_seconds > 0:
            time_since_last = (datetime.now() - self.last_triggered).total_seconds()
            if time_since_last < self.cooldown_seconds:
                return False
        
        # Check rate limiting
        if self.max_triggers_per_hour:
            hour_ago = datetime.now() - timedelta(hours=1)
            # In a real implementation, you'd track trigger history
            # For now, we'll use a simple counter reset
            
        # Evaluate all conditions (AND logic)
        return all(condition.evaluate(context) for condition in self.conditions)
    
    def trigger(self, context: Dict[str, Any]) -> bool:
        """Trigger the rule by executing all actions."""
        if not self.should_trigger(context):
            return False
        
        success = True
        for action in self.actions:
            if not action.execute(context):
                success = False
        
        # Update trigger statistics
        self.last_triggered = datetime.now()
        self.trigger_count += 1
        
        return success


class WorkflowAutomation:
    """
    Smart workflow automation system with rule management and execution.
    """
    
    def __init__(self, rules_file: Optional[Path] = None):
        """Initialize workflow automation system."""
        self.rules_file = rules_file or Path("smartpaste_rules.json")
        self.rules: List[Rule] = []
        self.logger = logging.getLogger(__name__)
        self.execution_lock = threading.RLock()
        self.stats = AutomationStats()
        
        # Load existing rules
        self.load_rules()
        
        # Create some default rules
        if not self.rules:
            self._create_default_rules()
    
    def add_rule(self, rule: Rule) -> None:
        """Add a new automation rule."""
        with self.execution_lock:
            self.rules.append(rule)
            self.save_rules()
            self.logger.info(f"Added automation rule: {rule.name}")
    
    def remove_rule(self, rule_id: str) -> bool:
        """Remove an automation rule."""
        with self.execution_lock:
            for i, rule in enumerate(self.rules):
                if rule.id == rule_id:
                    removed_rule = self.rules.pop(i)
                    self.save_rules()
                    self.logger.info(f"Removed automation rule: {removed_rule.name}")
                    return True
            return False
    
    def get_rule(self, rule_id: str) -> Optional[Rule]:
        """Get a rule by ID."""
        for rule in self.rules:
            if rule.id == rule_id:
                return rule
        return None
    
    def enable_rule(self, rule_id: str) -> bool:
        """Enable a rule."""
        rule = self.get_rule(rule_id)
        if rule:
            rule.enabled = True
            self.save_rules()
            return True
        return False
    
    def disable_rule(self, rule_id: str) -> bool:
        """Disable a rule."""
        rule = self.get_rule(rule_id)
        if rule:
            rule.enabled = False
            self.save_rules()
            return True
        return False
    
    def process_content(self, content: str, content_type: str, 
                       source_app: Optional[str] = None) -> Dict[str, Any]:
        """Process content through automation rules."""
        context = {
            'content': content,
            'content_type': content_type,
            'source_app': source_app,
            'timestamp': datetime.now(),
            'content_length': len(content)
        }
        
        triggered_rules = []
        
        with self.execution_lock:
            # Sort rules by priority (higher priority first)
            sorted_rules = sorted(self.rules, key=lambda r: r.priority, reverse=True)
            
            for rule in sorted_rules:
                try:
                    if rule.trigger(context):
                        triggered_rules.append(rule.id)
                        self.stats.rules_triggered += 1
                        self.logger.info(f"Triggered automation rule: {rule.name}")
                    
                except Exception as e:
                    self.stats.rules_failed += 1
                    self.logger.error(f"Error executing rule {rule.name}: {e}")
        
        self.stats.content_processed += 1
        
        return {
            'triggered_rules': triggered_rules,
            'context': context,
            'stats': asdict(self.stats)
        }
    
    def save_rules(self) -> None:
        """Save rules to file."""
        try:
            rules_data = []
            for rule in self.rules:
                rule_dict = asdict(rule)
                # Convert datetime objects to ISO strings
                rule_dict['created_at'] = rule.created_at.isoformat()
                if rule.last_triggered:
                    rule_dict['last_triggered'] = rule.last_triggered.isoformat()
                
                # Convert enum objects to their values for JSON serialization
                for condition in rule_dict['conditions']:
                    condition['type'] = condition['type'].value
                
                for action in rule_dict['actions']:
                    action['type'] = action['type'].value
                
                rules_data.append(rule_dict)
            
            self.rules_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.rules_file, 'w', encoding='utf-8') as f:
                json.dump(rules_data, f, indent=2, ensure_ascii=False)
        
        except Exception as e:
            self.logger.error(f"Error saving rules: {e}")
    
    def load_rules(self) -> None:
        """Load rules from file."""
        if not self.rules_file.exists():
            return
        
        try:
            with open(self.rules_file, 'r', encoding='utf-8') as f:
                rules_data = json.load(f)
            
            self.rules = []
            for rule_dict in rules_data:
                # Convert ISO strings back to datetime objects
                rule_dict['created_at'] = datetime.fromisoformat(rule_dict['created_at'])
                if rule_dict.get('last_triggered'):
                    rule_dict['last_triggered'] = datetime.fromisoformat(rule_dict['last_triggered'])
                
                # Convert conditions and actions
                conditions = [
                    Condition(
                        type=ConditionType(c['type']),
                        value=c['value'],
                        operator=c.get('operator', 'equals'),
                        case_sensitive=c.get('case_sensitive', False)
                    )
                    for c in rule_dict['conditions']
                ]
                
                actions = [
                    Action(
                        type=ActionType(a['type']),
                        parameters=a.get('parameters', {}),
                        delay_seconds=a.get('delay_seconds', 0.0),
                        enabled=a.get('enabled', True)
                    )
                    for a in rule_dict['actions']
                ]
                
                rule = Rule(
                    id=rule_dict['id'],
                    name=rule_dict['name'],
                    description=rule_dict['description'],
                    conditions=conditions,
                    actions=actions,
                    enabled=rule_dict.get('enabled', True),
                    priority=rule_dict.get('priority', 0),
                    created_at=rule_dict['created_at'],
                    last_triggered=rule_dict.get('last_triggered'),
                    trigger_count=rule_dict.get('trigger_count', 0),
                    cooldown_seconds=rule_dict.get('cooldown_seconds', 0.0),
                    max_triggers_per_hour=rule_dict.get('max_triggers_per_hour')
                )
                
                self.rules.append(rule)
            
            self.logger.info(f"Loaded {len(self.rules)} automation rules")
        
        except Exception as e:
            self.logger.error(f"Error loading rules: {e}")
    
    def _create_default_rules(self) -> None:
        """Create some useful default automation rules."""
        # Rule 1: Auto-save URLs to a bookmark file
        url_rule = Rule(
            id="auto_save_urls",
            name="Auto-save URLs",
            description="Automatically save URLs to a bookmark file",
            conditions=[
                Condition(ConditionType.CONTENT_TYPE, "url")
            ],
            actions=[
                Action(
                    ActionType.APPEND_TO_FILE,
                    parameters={
                        'file_path': 'smartpaste_bookmarks.txt',
                        'content': '[{timestamp}] {content}'
                    }
                ),
                Action(
                    ActionType.SEND_NOTIFICATION,
                    parameters={
                        'title': 'URL Saved',
                        'message': 'URL automatically saved to bookmarks'
                    }
                )
            ],
            priority=1
        )
        
        # Rule 2: Create todo for email addresses
        email_rule = Rule(
            id="email_to_todo",
            name="Email to Todo",
            description="Create todo items for email addresses",
            conditions=[
                Condition(ConditionType.CONTENT_TYPE, "email")
            ],
            actions=[
                Action(
                    ActionType.CREATE_TODO,
                    parameters={
                        'text': 'Follow up with: {content}',
                        'todo_file': 'smartpaste_followups.txt'
                    }
                )
            ],
            priority=2
        )
        
        # Rule 3: Transform code snippets
        code_rule = Rule(
            id="format_code",
            name="Format Code",
            description="Auto-format copied code snippets",
            conditions=[
                Condition(ConditionType.CONTENT_TYPE, "code")
            ],
            actions=[
                Action(
                    ActionType.TRANSFORM_CONTENT,
                    parameters={
                        'transformation': 'remove_whitespace'
                    }
                ),
                Action(
                    ActionType.SAVE_TO_FILE,
                    parameters={
                        'file_path': 'smartpaste_code_snippets/{date}_snippet.txt',
                        'content': '// Copied at {timestamp}\\n{transformed_content}'
                    }
                )
            ],
            priority=1
        )
        
        # Rule 4: Emergency keyword notification
        emergency_rule = Rule(
            id="emergency_alert",
            name="Emergency Alert",
            description="Send notification for emergency keywords",
            conditions=[
                Condition(
                    ConditionType.PATTERN_REGEX,
                    r'\\b(urgent|emergency|asap|critical|important)\\b',
                    case_sensitive=False
                )
            ],
            actions=[
                Action(
                    ActionType.SEND_NOTIFICATION,
                    parameters={
                        'title': '⚠️ Emergency Content Detected',
                        'message': 'Content contains emergency keywords',
                        'timeout': 10
                    }
                )
            ],
            priority=10,
            cooldown_seconds=300  # 5 minute cooldown
        )
        
        # Add all default rules
        self.rules.extend([url_rule, email_rule, code_rule, emergency_rule])
        self.save_rules()
        self.logger.info("Created default automation rules")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get automation statistics."""
        return {
            'total_rules': len(self.rules),
            'enabled_rules': len([r for r in self.rules if r.enabled]),
            'stats': asdict(self.stats),
            'most_triggered_rules': [
                {'id': rule.id, 'name': rule.name, 'trigger_count': rule.trigger_count}
                for rule in sorted(self.rules, key=lambda r: r.trigger_count, reverse=True)[:5]
            ]
        }


@dataclass
class AutomationStats:
    """Automation system statistics."""
    content_processed: int = 0
    rules_triggered: int = 0
    rules_failed: int = 0
    start_time: datetime = field(default_factory=datetime.now)
    
    def get_runtime_hours(self) -> float:
        """Get runtime in hours."""
        return (datetime.now() - self.start_time).total_seconds() / 3600


# Global automation instance
_workflow_automation: Optional[WorkflowAutomation] = None


def get_workflow_automation() -> WorkflowAutomation:
    """Get global workflow automation instance."""
    global _workflow_automation
    if _workflow_automation is None:
        _workflow_automation = WorkflowAutomation()
    return _workflow_automation