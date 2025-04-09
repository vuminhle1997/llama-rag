import logging
import logging.handlers
from pathlib import Path
from datetime import datetime

def setup_logging():
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    # Get current date for log file names
    current_date = datetime.now().strftime("%Y_%m_%d")

    # Main application logger
    logger = logging.getLogger("app")
    logger.setLevel(logging.DEBUG)

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Info file handler
    info_handler = logging.handlers.TimedRotatingFileHandler(
        filename=logs_dir / f"{current_date}.info.log",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8"
    )
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(formatter)
    info_handler.addFilter(lambda record: record.levelno <= logging.INFO)

    # Error file handler
    error_handler = logging.handlers.TimedRotatingFileHandler(
        filename=logs_dir / f"{current_date}.error.log",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)

    # Debug file handler
    debug_handler = logging.handlers.TimedRotatingFileHandler(
        filename=logs_dir / f"{current_date}.debug.log",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8"
    )
    debug_handler.setLevel(logging.DEBUG)
    debug_handler.setFormatter(formatter)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)

    # Add handlers
    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
    logger.addHandler(debug_handler)
    logger.addHandler(console_handler)

    return logger


# Uvicorn access logger configuration
def get_uvicorn_log_config():
    current_date = datetime.now().strftime("%Y_%m_%d")
    logs_dir = "logs"

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "access": {
                "()": "uvicorn.logging.AccessFormatter",
                "fmt": '%(asctime)s - %(client_addr)s - "%(request_line)s" %(status_code)s',
                "datefmt": "%Y-%m-%d %H:%M:%S",
                "use_colors": False,
            },
            "default": {
                "()": "uvicorn.logging.DefaultFormatter",
                "fmt": "%(asctime)s - %(levelprefix)s %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
                "use_colors": False,
            },
        },
        "handlers": {
            "access_file": {
                "class": "logging.handlers.TimedRotatingFileHandler",
                "filename": f"{logs_dir}/{current_date}.access.log",
                "when": "midnight",
                "interval": 1,
                "backupCount": 7,
                "formatter": "access",
                "encoding": "utf-8",
            },
            "default_file": {
                "class": "logging.handlers.TimedRotatingFileHandler",
                "filename": f"{logs_dir}/{current_date}.uvicorn.log",
                "when": "midnight",
                "interval": 1,
                "backupCount": 7,
                "formatter": "default",
                "encoding": "utf-8",
            },
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["default_file", "console"], "level": "INFO"},
            "uvicorn.error": {"level": "INFO"},
            "uvicorn.access": {
                "handlers": ["access_file"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }