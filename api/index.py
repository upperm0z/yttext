from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import re

app = Flask(__name__)
CORS(app)  # Разрешаем запросы из браузера

def extract_video_id(url):
    """Извлекает video_id из YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'^([a-zA-Z0-9_-]{11})$'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    """
    Получает транскрипт YouTube видео
    
    Ожидает JSON:
    {
        "url": "https://www.youtube.com/watch?v=VIDEO_ID"
    }
    
    Возвращает JSON:
    {
        "status": "success",
        "transcript": "полный текст транскрипта",
        "language": "ru"
    }
    """
    try:
        data = request.get_json()
        url = data.get('url', '')
        
        if not url:
            return jsonify({
                'status': 'error',
                'message': 'URL не указан'
            }), 400
        
        # Извлекаем video_id
        video_id = extract_video_id(url)
        if not video_id:
            return jsonify({
                'status': 'error',
                'message': 'Неверная ссылка на YouTube видео'
            }), 400
        
        # Пробуем получить транскрипт на русском, потом на английском
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Пытаемся найти русский транскрипт
            try:
                transcript = transcript_list.find_transcript(['ru'])
                language = 'ru'
            except:
                # Если нет русского, берём английский и переводим
                transcript = transcript_list.find_transcript(['en'])
                language = 'en'
            
            # Получаем текст
            transcript_data = transcript.fetch()
            formatter = TextFormatter()
            transcript_text = formatter.format_transcript(transcript_data)
            
            return jsonify({
                'status': 'success',
                'transcript': transcript_text,
                'language': language,
                'video_id': video_id
            })
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Не удалось получить транскрипт: {str(e)}. Возможно, для этого видео субтитры недоступны.'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка сервера: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Проверка работы API"""
    return jsonify({
        'status': 'ok',
        'message': 'YouTube Transcript API is running'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
