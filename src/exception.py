import sys
from src.logger import logging
from typing import Optional, Type

def error_message_detail(error: Exception, error_detail: sys) -> str:
    """
    Constructs a detailed error message including file name and line number.
    
    Args:
        error: The exception object
        error_detail: sys module reference for traceback info
        
    Returns:
        Formatted error message string
    """
    _, _, exc_tb = error_detail.exc_info()
    if exc_tb is None:
        return str(error)
        
    file_name = exc_tb.tb_frame.f_code.co_filename
    line_number = exc_tb.tb_lineno
    error_msg = str(error)
    
    return (
        f"Error occurred in Python script '{file_name}' "
        f"at line {line_number}: {error_msg}"
    )

class CustomException(Exception):
    """Custom exception class with detailed error reporting."""
    
    def __init__(self, error_message: str, error_detail: sys):
        """
        Initialize custom exception with detailed context.
        
        Args:
            error_message: Description of the error
            error_detail: sys module reference for traceback
        """
        self.error_message = error_message_detail(error_message, error_detail)
        super().__init__(self.error_message)
        
        # Log the error immediately upon creation
        logging.error(self.error_message)

    def __str__(self) -> str:
        return self.error_message

    @classmethod
    def from_exception(cls, exc: Exception, error_detail: sys) -> 'CustomException':
        """
        Alternative constructor that takes an existing exception.
        
        Args:
            exc: Existing exception to wrap
            error_detail: sys module reference
            
        Returns:
            New CustomException instance
        """
        return cls(str(exc), error_detail)