"""
Async Processing System for SmartPaste AI

Provides asynchronous processing, task queuing, and performance optimization.
"""

import asyncio
import time
import threading
import queue
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from typing import Any, Callable, Dict, List, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import logging
import multiprocessing as mp


class TaskPriority(Enum):
    """Task priority levels."""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class Task:
    """Represents a processing task."""
    id: str
    func: Callable
    args: tuple = ()
    kwargs: dict = field(default_factory=dict)
    priority: TaskPriority = TaskPriority.NORMAL
    created_at: datetime = field(default_factory=datetime.now)
    callback: Optional[Callable] = None
    timeout: Optional[float] = None
    retries: int = 0
    max_retries: int = 3
    
    def __lt__(self, other):
        """Compare tasks by priority for queue ordering."""
        return self.priority.value > other.priority.value


@dataclass
class TaskResult:
    """Result of a task execution."""
    task_id: str
    success: bool
    result: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    retries_used: int = 0


class AsyncProcessor:
    """
    Advanced async processor with task queuing, priority handling, and performance monitoring.
    """
    
    def __init__(self, max_workers: int = None, max_process_workers: int = None,
                 queue_size: int = 1000, enable_process_pool: bool = False):
        """Initialize the async processor.
        
        Args:
            max_workers: Maximum thread pool workers
            max_process_workers: Maximum process pool workers
            queue_size: Maximum queue size
            enable_process_pool: Whether to enable process pool for CPU-intensive tasks
        """
        self.max_workers = max_workers or min(32, (mp.cpu_count() or 1) + 4)
        self.max_process_workers = max_process_workers or (mp.cpu_count() or 1)
        self.queue_size = queue_size
        self.enable_process_pool = enable_process_pool
        
        # Task queue with priority support
        self.task_queue = queue.PriorityQueue(maxsize=queue_size)
        self.results: Dict[str, TaskResult] = {}
        self.active_tasks: Dict[str, Task] = {}
        
        # Thread pools
        self.thread_pool = ThreadPoolExecutor(max_workers=self.max_workers)
        
        if enable_process_pool:
            self.process_pool = ProcessPoolExecutor(max_workers=self.max_process_workers)
        else:
            self.process_pool = None
        
        # Worker threads
        self.worker_threads: List[threading.Thread] = []
        self.running = False
        self.stats = ProcessorStats()
        
        self.logger = logging.getLogger(__name__)
        
    def start(self) -> None:
        """Start the async processor."""
        if self.running:
            return
        
        self.running = True
        
        # Start worker threads
        for i in range(min(4, self.max_workers)):
            worker = threading.Thread(
                target=self._worker_loop,
                name=f"AsyncWorker-{i}",
                daemon=True
            )
            worker.start()
            self.worker_threads.append(worker)
        
        self.logger.info(f"Started async processor with {len(self.worker_threads)} workers")
    
    def stop(self, timeout: float = 5.0) -> None:
        """Stop the async processor."""
        if not self.running:
            return
        
        self.running = False
        
        # Add poison pills to stop workers
        for _ in self.worker_threads:
            self.task_queue.put((TaskPriority.CRITICAL, None))
        
        # Wait for workers to finish
        for worker in self.worker_threads:
            worker.join(timeout=timeout)
        
        # Shutdown thread pools
        self.thread_pool.shutdown(wait=True)
        if self.process_pool:
            self.process_pool.shutdown(wait=True)
        
        self.logger.info("Stopped async processor")
    
    def submit_task(self, func: Callable, *args, task_id: Optional[str] = None,
                   priority: TaskPriority = TaskPriority.NORMAL,
                   callback: Optional[Callable] = None,
                   timeout: Optional[float] = None,
                   use_process_pool: bool = False,
                   **kwargs) -> str:
        """Submit a task for async execution.
        
        Args:
            func: Function to execute
            *args: Function arguments
            task_id: Optional task ID (auto-generated if None)
            priority: Task priority
            callback: Callback function for result
            timeout: Task timeout in seconds
            use_process_pool: Whether to use process pool instead of thread pool
            **kwargs: Function keyword arguments
        
        Returns:
            Task ID
        """
        if not self.running:
            self.start()
        
        # Generate task ID if not provided
        if task_id is None:
            task_id = f"task_{int(time.time() * 1000000)}"
        
        # Create task
        task = Task(
            id=task_id,
            func=func,
            args=args,
            kwargs=kwargs,
            priority=priority,
            callback=callback,
            timeout=timeout
        )
        
        # Add process pool flag to kwargs for worker
        task.kwargs['_use_process_pool'] = use_process_pool
        
        try:
            self.task_queue.put((priority, task), timeout=1.0)
            self.stats.tasks_submitted += 1
            self.logger.debug(f"Submitted task {task_id} with priority {priority.name}")
            return task_id
        except queue.Full:
            self.stats.tasks_rejected += 1
            raise RuntimeError("Task queue is full")
    
    def get_result(self, task_id: str, timeout: Optional[float] = None) -> Optional[TaskResult]:
        """Get task result (blocking)."""
        start_time = time.time()
        
        while True:
            if task_id in self.results:
                return self.results.pop(task_id)
            
            if timeout and (time.time() - start_time) > timeout:
                return None
            
            time.sleep(0.01)  # Small delay to prevent busy waiting
    
    def get_result_async(self, task_id: str) -> Optional[TaskResult]:
        """Get task result (non-blocking)."""
        return self.results.pop(task_id, None)
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a pending task."""
        # Note: This is a simplified implementation
        # In practice, you'd need more sophisticated cancellation
        if task_id in self.active_tasks:
            self.logger.warning(f"Cannot cancel active task {task_id}")
            return False
        
        return True
    
    def _worker_loop(self) -> None:
        """Main worker loop."""
        while self.running:
            try:
                # Get task from queue
                priority, task = self.task_queue.get(timeout=1.0)
                
                # Check for poison pill
                if task is None:
                    break
                
                # Execute task
                self._execute_task(task)
                
            except queue.Empty:
                continue
            except Exception as e:
                self.logger.error(f"Error in worker loop: {e}")
    
    def _execute_task(self, task: Task) -> None:
        """Execute a single task."""
        self.active_tasks[task.id] = task
        start_time = time.time()
        
        try:
            # Choose execution method
            use_process_pool = task.kwargs.pop('_use_process_pool', False)
            
            if use_process_pool and self.process_pool:
                future = self.process_pool.submit(task.func, *task.args, **task.kwargs)
            else:
                future = self.thread_pool.submit(task.func, *task.args, **task.kwargs)
            
            # Wait for result with timeout
            try:
                result = future.result(timeout=task.timeout)
                
                # Create success result
                task_result = TaskResult(
                    task_id=task.id,
                    success=True,
                    result=result,
                    execution_time=time.time() - start_time,
                    retries_used=task.retries
                )
                
                self.stats.tasks_completed += 1
                
            except Exception as e:
                # Handle task failure
                task_result = TaskResult(
                    task_id=task.id,
                    success=False,
                    error=str(e),
                    execution_time=time.time() - start_time,
                    retries_used=task.retries
                )
                
                # Retry if possible
                if task.retries < task.max_retries:
                    task.retries += 1
                    self.logger.warning(f"Retrying task {task.id} (attempt {task.retries})")
                    self.task_queue.put((task.priority, task))
                    return
                
                self.stats.tasks_failed += 1
                self.logger.error(f"Task {task.id} failed: {e}")
            
            # Store result
            self.results[task.id] = task_result
            
            # Call callback if provided
            if task.callback:
                try:
                    task.callback(task_result)
                except Exception as e:
                    self.logger.error(f"Error in task callback: {e}")
        
        finally:
            # Clean up
            self.active_tasks.pop(task.id, None)
    
    def get_stats(self) -> 'ProcessorStats':
        """Get processor statistics."""
        self.stats.active_tasks = len(self.active_tasks)
        self.stats.queue_size = self.task_queue.qsize()
        return self.stats
    
    def get_info(self) -> Dict[str, Any]:
        """Get detailed processor information."""
        stats = self.get_stats()
        
        return {
            'stats': stats.__dict__,
            'running': self.running,
            'workers': len(self.worker_threads),
            'thread_pool_workers': self.max_workers,
            'process_pool_workers': self.max_process_workers if self.process_pool else 0,
            'process_pool_enabled': self.enable_process_pool
        }


@dataclass
class ProcessorStats:
    """Async processor statistics."""
    tasks_submitted: int = 0
    tasks_completed: int = 0
    tasks_failed: int = 0
    tasks_rejected: int = 0
    active_tasks: int = 0
    queue_size: int = 0
    
    def completion_rate(self) -> float:
        """Calculate completion rate percentage."""
        total = self.tasks_completed + self.tasks_failed
        return (self.tasks_completed / total * 100) if total > 0 else 0.0


class ContentProcessor:
    """
    Specialized async processor for content processing with intelligent scheduling.
    """
    
    def __init__(self, max_workers: int = 8):
        """Initialize content processor."""
        self.processor = AsyncProcessor(
            max_workers=max_workers,
            enable_process_pool=True,
            queue_size=2000
        )
        self.logger = logging.getLogger(__name__)
        
        # Content type processing priorities
        self.type_priorities = {
            'url': TaskPriority.NORMAL,
            'text': TaskPriority.NORMAL,
            'image': TaskPriority.LOW,     # Image processing is slow
            'code': TaskPriority.HIGH,     # Code analysis is important
            'email': TaskPriority.HIGH,    # Email processing is important
            'math': TaskPriority.NORMAL,
            'number': TaskPriority.HIGH    # Number conversion is fast
        }
    
    def start(self) -> None:
        """Start the content processor."""
        self.processor.start()
    
    def stop(self) -> None:
        """Stop the content processor."""
        self.processor.stop()
    
    def process_content_async(self, content: str, content_type: str,
                            handler_func: Callable, callback: Optional[Callable] = None,
                            timeout: float = 30.0) -> str:
        """Process content asynchronously.
        
        Args:
            content: Content to process
            content_type: Type of content
            handler_func: Handler function
            callback: Result callback
            timeout: Processing timeout
        
        Returns:
            Task ID
        """
        priority = self.type_priorities.get(content_type, TaskPriority.NORMAL)
        use_process_pool = content_type in ['image', 'code']  # CPU-intensive tasks
        
        task_id = self.processor.submit_task(
            handler_func,
            content,
            task_id=f"content_{content_type}_{int(time.time() * 1000)}",
            priority=priority,
            callback=callback,
            timeout=timeout,
            use_process_pool=use_process_pool
        )
        
        self.logger.debug(f"Submitted {content_type} content processing task {task_id}")
        return task_id
    
    def get_result(self, task_id: str, timeout: float = 5.0) -> Optional[TaskResult]:
        """Get processing result."""
        return self.processor.get_result(task_id, timeout)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get content processor statistics."""
        return self.processor.get_info()


# Global processor instance
_content_processor: Optional[ContentProcessor] = None


def get_content_processor() -> ContentProcessor:
    """Get global content processor instance."""
    global _content_processor
    if _content_processor is None:
        _content_processor = ContentProcessor()
    return _content_processor