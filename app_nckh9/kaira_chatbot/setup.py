import nltk
import os
import logging

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_nltk():
    """Tải các resource cần thiết từ NLTK"""
    try:
        logger.info("Đang tải NLTK resources...")
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        logger.info("Đã tải xong NLTK resources")
    except Exception as e:
        logger.error(f"Lỗi khi tải NLTK resources: {e}")
        raise

def create_directories():
    """Tạo các thư mục cần thiết cho ứng dụng"""
    directories = ['doc', 'model2vec', 'cache']
    try:
        for dir in directories:
            if not os.path.exists(dir):
                os.makedirs(dir)
                logger.info(f"Đã tạo thư mục {dir}")
    except Exception as e:
        logger.error(f"Lỗi khi tạo thư mục: {e}")
        raise

def main():
    """Chạy toàn bộ quá trình setup"""
    try:
        logger.info("Bắt đầu quá trình setup...")
        create_directories()
        setup_nltk()
        logger.info("Setup hoàn tất!")
    except Exception as e:
        logger.error(f"Lỗi trong quá trình setup: {e}")
        raise

if __name__ == "__main__":
    main()