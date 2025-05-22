import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from datetime import datetime
import hashlib
import pickle
from dotenv import load_dotenv
import google.generativeai as genai
import numpy as np
import faiss
import logging
import json
import threading
import sys
from queue import Queue
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Tuple, Optional
from tqdm import tqdm
from docx import Document
from transformers import AutoTokenizer, AutoModel
import torch
from tenacity import retry, stop_after_attempt, wait_exponential
import nltk
from nltk.tokenize import sent_tokenize
import re

# === LOGGING SETUP ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chatbot.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# === LOAD CONFIG ===
def load_config() -> Dict[str, Any]:
    """Load configuration from config.json or use default values."""
    default_config = {
        "doc_folder": "doc/",
        "model_folder": "model2vec/",
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "cache_dir": "cache/",
        "top_k": 4,
        "chunk_size": 1000,
        "min_text_length": 30,
        "max_workers": 8,
        "faiss_nlist": 10,
        "llm_cache_size": 1000,
        "batch_size": 32,
        "retry_attempts": 3,
        "retry_delay": 1
    }
    
    try:
        if os.path.exists('config.json'):
            with open('config.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
                return {**default_config, **config}
    except Exception as e:
        logger.warning(f"Cannot read config.json: {e}")
    
    return default_config

CONFIG = load_config()

# === FILE PATHS ===
MODEL_PATH = os.path.join(CONFIG['model_folder'], 'pytorch_model.bin')
INDEX_PATH = os.path.join(CONFIG['cache_dir'], 'faiss.index')
EMBEDDINGS_PATH = os.path.join(CONFIG['cache_dir'], 'vectors.npy')
LLM_CACHE_PATH = os.path.join(CONFIG['cache_dir'], 'llm_cache.pkl')

# === BLACKLIST KEYWORDS ===
BLACKLIST_KEYWORDS = [
    "tục tĩu", "sex", "xxx", "bậy", "ngu", "đồ ngu", "chửi", "mẹ mày",
    "địt", "lồn", "cặc", "buồi", "đm", "đcm", "vcl", "vl"
]

# === EMBEDDING CLASS ===
class Model2VecEmbedder:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance
    
    def __init__(self, model_name: str):
        if not hasattr(self, 'model'):
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=CONFIG['cache_dir'])
                self.model = AutoModel.from_pretrained(model_name, cache_dir=CONFIG['cache_dir'])
                self.model.eval()
                if torch.cuda.is_available():
                    self.model = self.model.cuda()
                self.dimension = 384
                self.batch_size = CONFIG['batch_size']
                self.embedding_cache = {}
                if os.path.exists(CONFIG['embedding_cache_file']):
                    try:
                        with open(CONFIG['embedding_cache_file'], 'rb') as f:
                            self.embedding_cache = pickle.load(f)
                    except Exception as e:
                        logger.error(f"Error loading embedding cache: {e}")
                logger.info(f"Model loaded successfully. Using {'CUDA' if torch.cuda.is_available() else 'CPU'}")
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                raise

    def _save_cache(self):
        """Save embedding cache to disk."""
        try:
            if len(self.embedding_cache) > CONFIG['embedding_cache_size']:
                # Remove oldest items
                items = sorted(self.embedding_cache.items(), key=lambda x: x[1]['timestamp'])
                self.embedding_cache = dict(items[-CONFIG['embedding_cache_size']:])
            with open(CONFIG['embedding_cache_file'], 'wb') as f:
                pickle.dump(self.embedding_cache, f)
        except Exception as e:
            logger.error(f"Error saving embedding cache: {e}")

    @retry(stop=stop_after_attempt(CONFIG['retry_attempts']),
           wait=wait_exponential(multiplier=CONFIG['retry_delay'], min=1, max=10))
    @torch.no_grad()
    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a batch of texts with caching."""
        try:
            results = []
            texts_to_embed = []
            indices_to_embed = []

            # Check cache first
            for i, text in enumerate(texts):
                cache_key = hashlib.md5(text.encode()).hexdigest()
                if cache_key in self.embedding_cache:
                    results.append(self.embedding_cache[cache_key]['embedding'])
                else:
                    texts_to_embed.append(text)
                    indices_to_embed.append(i)

            if texts_to_embed:
                inputs = self.tokenizer(texts_to_embed, padding=True, truncation=True, return_tensors="pt")
                if torch.cuda.is_available():
                    inputs = {k: v.cuda() for k, v in inputs.items()}
                    
                outputs = self.model(**inputs)
                new_embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()

                # Update cache with new embeddings
                for i, embedding in zip(range(len(texts_to_embed)), new_embeddings):
                    cache_key = hashlib.md5(texts_to_embed[i].encode()).hexdigest()
                    self.embedding_cache[cache_key] = {
                        'embedding': embedding,
                        'timestamp': datetime.now().timestamp()
                    }

                # Place new embeddings in correct positions
                final_embeddings = np.zeros((len(texts), self.dimension))
                current_new_idx = 0
                
                for i in range(len(texts)):
                    if i in indices_to_embed:
                        final_embeddings[i] = new_embeddings[current_new_idx]
                        current_new_idx += 1
                    else:
                        final_embeddings[i] = results[i - current_new_idx]
                
                self._save_cache()
                return final_embeddings
            
            return np.vstack(results)

        except Exception as e:
            logger.error(f"Error embedding batch: {e}")
            raise

    def embed(self, text: str) -> np.ndarray:
        """Generate embedding for a single text with caching."""
        embeddings = self.embed_batch([text])
        return embeddings[0]

# === AUTO SETUP ===
def auto_setup() -> None:
    """Create necessary directories and initialize components."""
    dirs = [CONFIG['doc_folder'], CONFIG['model_folder'], CONFIG['cache_dir']]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d)
            logger.info(f"Created directory {d}")
    
    init_llm_cache()

def init_llm_cache() -> None:
    """Initialize LLM response cache."""
    if not os.path.exists(LLM_CACHE_PATH):
        with open(LLM_CACHE_PATH, 'wb') as f:
            pickle.dump({}, f)
        logger.info(f"Initialized LLM cache at {LLM_CACHE_PATH}")

# === OPTIMIZED DOCUMENT PROCESSING ===
def process_document(file_path: str, queue: Queue) -> None:
    """Process a .docx file with optimized chunk creation."""
    try:
        doc = Document(file_path)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for para in doc.paragraphs:
            text = para.text.strip()
            if len(text) < CONFIG['min_text_length']:
                continue
                
            sentences = sent_tokenize(text)
            for sentence in sentences:
                if current_length + len(sentence.split()) <= CONFIG['chunk_size']:
                    current_chunk.append(sentence)
                    current_length += len(sentence.split())
                else:
                    if current_chunk:
                        chunks.append(' '.join(current_chunk))
                    current_chunk = [sentence]
                    current_length = len(sentence.split())
                    
        if current_chunk:
            chunks.append(' '.join(current_chunk))
            
        queue.put((file_path, chunks))
        logger.info(f"Processed file {file_path}: {len(chunks)} chunks")
    except Exception as e:
        logger.error(f"Error processing file {file_path}: {e}")
        queue.put((file_path, []))

def load_documents(folder: str) -> List[str]:
    """Load and process .docx files with parallel processing."""
    docx_files = [f for f in os.listdir(folder) if f.endswith(".docx")]
    if not docx_files:
        logger.error(f"No .docx files found in {folder}")
        raise ValueError("No .docx files found")
    
    chunks = []
    queue = Queue()
    
    with ThreadPoolExecutor(max_workers=CONFIG['max_workers']) as executor:
        futures = []
        for fname in docx_files:
            file_path = os.path.join(folder, fname)
            futures.append(executor.submit(process_document, file_path, queue))
        
        for future in as_completed(futures):
            future.result()
    
    while not queue.empty():
        _, file_chunks = queue.get()
        chunks.extend(file_chunks)
    
    if not chunks:
        logger.warning("No content found in .docx files")
    else:
        logger.info(f"Loaded {len(chunks)} text chunks")
    
    return chunks

# === OPTIMIZED INDEX OPERATIONS ===
def build_or_load_index(embedder: Model2VecEmbedder, texts: List[str]) -> Tuple[faiss.Index, List[str], np.ndarray]:
    """Build or load FAISS index with batched processing."""
    texts_path = os.path.join(CONFIG['cache_dir'], 'texts.pkl')
    
    if all(os.path.exists(p) for p in [INDEX_PATH, EMBEDDINGS_PATH, texts_path]):
        try:
            logger.info("Loading FAISS index from cache...")
            with open(texts_path, 'rb') as f:
                cached_texts = pickle.load(f)
            vectors = np.load(EMBEDDINGS_PATH, mmap_mode='r')  # Memory-mapped file
            index = faiss.read_index(INDEX_PATH)
            if torch.cuda.is_available():
                res = faiss.StandardGpuResources()
                index = faiss.index_cpu_to_gpu(res, 0, index)
            return index, cached_texts, vectors
        except Exception as e:
            logger.error(f"Error loading index from cache: {e}")

    logger.info("Building FAISS index...")
    try:
        # Process embeddings in batches
        vectors = []
        for i in range(0, len(texts), embedder.batch_size):
            batch = texts[i:i + embedder.batch_size]
            batch_vectors = embedder.embed_batch(batch)
            vectors.append(batch_vectors)
        vectors = np.vstack(vectors).astype('float32')

        # Build appropriate index
        if len(texts) < CONFIG['faiss_nlist']:
            index = faiss.IndexFlatL2(embedder.dimension)
        else:
            quantizer = faiss.IndexFlatL2(embedder.dimension)
            nlist = min(len(texts), CONFIG['faiss_nlist'])
            index = faiss.IndexIVFFlat(quantizer, embedder.dimension, nlist)
            index.train(vectors)

        # Use GPU if available
        if torch.cuda.is_available():
            res = faiss.StandardGpuResources()
            index = faiss.index_cpu_to_gpu(res, 0, index)

        index.add(vectors)
        
        # Save to cache
        if torch.cuda.is_available():
            index = faiss.index_gpu_to_cpu(index)
        faiss.write_index(index, INDEX_PATH)
        np.save(EMBEDDINGS_PATH, vectors)
        with open(texts_path, 'wb') as f:
            pickle.dump(texts, f)
        
        # Convert back to GPU if needed
        if torch.cuda.is_available():
            res = faiss.StandardGpuResources()
            index = faiss.index_cpu_to_gpu(res, 0, index)
        
        return index, texts, vectors
    except Exception as e:
        logger.error(f"Error building index: {e}")
        raise

def retrieve(query: str, embedder: Model2VecEmbedder, index: faiss.Index, texts: List[str], top_k: int = None) -> List[str]:
    """Retrieve relevant text chunks with optimized search."""
    if top_k is None:
        top_k = CONFIG['top_k']
    try:
        q_vec = embedder.embed(query).astype('float32').reshape(1, -1)
        D, I = index.search(q_vec, top_k)
        results = []
        seen = set()  # Avoid duplicate chunks
        for i in I[0]:
            if i < len(texts) and texts[i] not in seen:
                results.append(texts[i])
                seen.add(texts[i])
        logger.debug(f"Found {len(results)} unique results for query")
        return results
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return []

# === OPTIMIZED LLM INTERACTION ===
def setup_gemini():
    """Configure Google Gemini API with caching."""
    load_dotenv()
    api_key = os.getenv('GOOGLE_API_KEY')
    model_name = os.getenv('GEMINI_MODEL', 'gemini-pro')
    
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file")
        
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)

def get_cache_key(prompt: str) -> str:
    """Generate cache key for LLM response."""
    return hashlib.md5(prompt.encode()).hexdigest()

def get_cached_response(prompt: str) -> Optional[str]:
    """Get cached LLM response if available."""
    try:
        with open(LLM_CACHE_PATH, 'rb') as f:
            cache = pickle.load(f)
        return cache.get(get_cache_key(prompt))
    except Exception:
        return None

def cache_response(prompt: str, response: str) -> None:
    """Cache LLM response for future use."""
    try:
        with open(LLM_CACHE_PATH, 'rb') as f:
            cache = pickle.load(f)
        
        # Implement LRU-style cache
        if len(cache) >= CONFIG['llm_cache_size']:
            keys = list(cache.keys())
            for _ in range(len(cache) - CONFIG['llm_cache_size'] + 1):
                del cache[keys.pop(0)]
                
        cache[get_cache_key(prompt)] = response
        
        with open(LLM_CACHE_PATH, 'wb') as f:
            pickle.dump(cache, f)
    except Exception as e:
        logger.error(f"Error caching response: {e}")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def ask_llm(prompt: str) -> str:
    """Call Gemini API with enhanced response quality control."""
    cached_response = get_cached_response(prompt)
    if cached_response:
        logger.debug("Using cached response")
        return cached_response

    try:
        model = setup_gemini()
        
        # Configure generation parameters
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 2048,
            "stop_sequences": ["Người dùng:", "Human:", "Assistant:"],
            "candidate_count": 1
        }
        
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
        ]
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        if not response.text:
            return "Xin lỗi, tôi không thể tạo câu trả lời lúc này."
            
        # Post-process response
        answer = response.text.strip()
        
        # Ensure reasonable length
        if len(answer.split()) > 200:  # Khoảng 10-15 câu
            paragraphs = answer.split('\n\n')
            answer = '\n\n'.join(paragraphs[:3])  # Giữ 3 đoạn văn đầu tiên
            answer += "\n\n(Đã tóm tắt nội dung chính)"
        
        # Cache processed response
        cache_response(prompt, answer)
        return answer
        
    except Exception as e:
        logger.error(f"Error calling LLM: {e}")
        raise

            
        context = []
        # Use full context of last message for direct continuity
        question, answer = self.messages[-1]
        context.append(f"Tin nhắn gần nhất:\nNgười dùng: {question}\nTrợ lý: {answer}\n")
        
        # Add abbreviated context from older messages
        if len(self.messages) > 1:
            context.append("Tóm tắt cuộc hội thoại trước:")
            for q, a in self.messages[-4:-1]: # Get 3 more historical messages
                # Extract key points only
                q_summary = q[:100] + "..." if len(q) > 100 else q
                a_summary = a[:150] + "..." if len(a) > 150 else a
                context.append(f"Người dùng: {q_summary}\nTrợ lý: {a_summary}")
                
        return "\n---\n".join(context)

# === CONTENT FILTERING ===
def filter_sensitive_content(query: str) -> Tuple[bool, str]:
    """Enhanced content filtering with regex patterns."""
    query_lower = query.lower()
    
    # Kiểm tra từng từ khóa với regex
    for keyword in BLACKLIST_KEYWORDS:
        if re.search(r'\b' + re.escape(keyword) + r'\b', query_lower):
            logger.warning(f"Phát hiện nội dung không phù hợp")
            return False, "Xin lỗi, câu hỏi của bạn chứa nội dung không phù hợp. Vui lòng đặt câu hỏi khác."
    
    return True, ""

# === MAIN CHAT FUNCTION ===
def chat(query: str, embedder: Model2VecEmbedder, index: faiss.Index, texts: List[str]) -> str:
    """Optimized chat function without context memory."""
    try:
        # Kiểm tra nội dung
        is_appropriate, message = filter_sensitive_content(query)
        if not is_appropriate:
            return message

        # Tìm kiếm thông tin liên quan
        contexts = retrieve(query, embedder, index, texts)
        if not contexts:
            return "Xin lỗi, tôi không tìm thấy thông tin liên quan trong tài liệu được cung cấp."

        # Tạo prompt với template tối ưu
        prompt = f"""Vai trò: Bạn là một trợ lý AI chuyên nghiệp, thông minh và hữu ích.

Thông tin tham khảo từ tài liệu:
{' '.join(contexts)}

Câu hỏi hiện tại: {query}

Yêu cầu:
1. Trả lời bằng tiếng Việt, rõ ràng và dễ hiểu
2. Đảm bảo câu trả lời:
   - Chính xác và phù hợp với thông tin trong tài liệu
   - Ngắn gọn, súc tích (tối đa 3-4 câu cho mỗi ý chính)
   - Có cấu trúc rõ ràng nếu cần liệt kê nhiều điểm
3. Không thêm thông tin ngoài tài liệu tham khảo

Trả lời:"""

        # Gọi API
        answer = ask_llm(prompt)
        return answer

    except Exception as e:
        logger.error(f"Lỗi trong quá trình xử lý: {e}")
        return "Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn."

# === MAIN ===
def main():
    """Optimized main function with better error handling."""
    try:
        auto_setup()
        logger.info("Khởi tạo model...")
        embedder = Model2VecEmbedder(CONFIG['model_name'])

        logger.info("Đọc tài liệu...")
        texts = load_documents(CONFIG['doc_folder'])
        if not texts:
            logger.error(f"Không tìm thấy nội dung hợp lệ trong {CONFIG['doc_folder']}")
            raise ValueError("Không tìm thấy nội dung hợp lệ")

        logger.info("Khởi tạo FAISS index...")
        index, texts, _ = build_or_load_index(embedder, texts)

        print("\n💬 Sẵn sàng trò chuyện! Gõ 'exit' để thoát.")

        while True:
            try:
                query = input("\n🤖 Hãy đặt câu hỏi: ").strip()
                if query.lower() in ["exit", "quit"]:
                    break
                if not query:
                    continue

                answer = chat(query, embedder, index, texts)
                print(f"\n🤖 {answer}")

            except KeyboardInterrupt:
                print("\nĐang thoát chương trình...")
                break
            except Exception as e:
                logger.error(f"Lỗi: {e}")
                print("\nCó lỗi xảy ra, vui lòng thử lại.")

    except Exception as e:
        logger.error(f"Lỗi khởi tạo: {e}")
        print("Có lỗi xảy ra khi khởi tạo chương trình.")

if __name__ == "__main__":
    main()