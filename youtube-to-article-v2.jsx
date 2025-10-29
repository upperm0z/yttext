import React, { useState } from 'react';
import { FileText, Download, Loader2, AlertCircle, CheckCircle, Globe } from 'lucide-react';

export default function YouTubeToArticle() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [article, setArticle] = useState('');
  const [stage, setStage] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [apiUrl, setApiUrl] = useState('http://localhost:5000'); // Можно изменить на свой URL

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const fetchTranscriptFromAPI = async (videoUrl) => {
    try {
      const response = await fetch(`${apiUrl}/api/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка получения транскрипта');
      }

      const data = await response.json();
      return data.transcript;
    } catch (err) {
      throw err;
    }
  };

  const formatToArticle = async (transcriptText) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Преобразуй этот транскрипт YouTube видео в хорошо структурированную статью на русском языке.

ВАЖНО:
- Если транскрипт на английском - переведи на русский
- Создай понятную структуру с заголовками
- Убери повторы и "мусорные" слова
- Сделай текст читаемым и связным
- Добавь краткое введение и заключение
- Используй markdown форматирование (## для заголовков, **для выделения**)

Транскрипт:
${transcriptText}

Ответь ТОЛЬКО готовой статьёй в формате markdown, без дополнительных комментариев.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка API Claude');
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (err) {
      throw new Error(`Ошибка форматирования: ${err.message}`);
    }
  };

  const handleAutoConvert = async () => {
    setError('');
    setTranscript('');
    setArticle('');
    setLoading(true);
    setShowManualInput(false);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Неверная ссылка на YouTube видео');
      }

      // Получение транскрипта через API
      setStage('Получение транскрипта с YouTube...');
      let transcriptText;
      
      try {
        transcriptText = await fetchTranscriptFromAPI(url);
      } catch (err) {
        // Если API не работает, предлагаем ручной ввод
        setShowManualInput(true);
        setError(`Не удалось автоматически получить субтитры: ${err.message}. Вставьте транскрипт вручную ниже.`);
        setLoading(false);
        return;
      }

      setTranscript(transcriptText);

      // Форматирование в статью
      setStage('Форматирование в статью с помощью Claude...');
      const formattedArticle = await formatToArticle(transcriptText);
      setArticle(formattedArticle);

      setStage('Готово! ✨');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualConvert = async () => {
    if (!manualTranscript.trim()) {
      setError('Пожалуйста, вставьте транскрипт');
      return;
    }

    setError('');
    setArticle('');
    setLoading(true);

    try {
      setStage('Форматирование в статью с помощью Claude...');
      setTranscript(manualTranscript);
      const formattedArticle = await formatToArticle(manualTranscript);
      setArticle(formattedArticle);
      setStage('Готово! ✨');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadArticle = () => {
    const blob = new Blob([article], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-article.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              YouTube → Статья
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Преобразуй любое YouTube видео в структурированную статью на русском языке
          </p>
        </div>

        {/* API Configuration */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                API Backend URL:
              </p>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://your-api.vercel.app"
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
              <p className="text-xs text-blue-700 mt-2">
                После деплоя на Vercel вставь сюда свой URL (например: https://youtube-api-xyz.vercel.app)
              </p>
            </div>
          </div>
        </div>

        {/* Auto Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            🚀 Автоматический режим
          </h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={handleAutoConvert}
              disabled={loading || !url}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Обработка...
                </>
              ) : (
                'Конвертировать'
              )}
            </button>
          </div>

          {/* Loading Stage */}
          {loading && stage && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <p className="text-blue-700 text-sm">{stage}</p>
            </div>
          )}

          {/* Success */}
          {!loading && stage.includes('Готово') && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-700 text-sm font-semibold">{stage}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Ошибка</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Input Section */}
        {showManualInput && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              📝 Ручной ввод транскрипта
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                Как скопировать субтитры с YouTube:
              </p>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Откройте видео на YouTube</li>
                <li>Нажмите на три точки <strong>"⋮"</strong> под видео</li>
                <li>Выберите <strong>"Show transcript"</strong> / <strong>"Показать расшифровку"</strong></li>
                <li>Справа откроется панель - скопируйте весь текст</li>
              </ol>
            </div>

            <textarea
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              placeholder="Вставьте текст субтитров сюда...

Пример:
0:00
Привет всем, сегодня мы поговорим о..."
              className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
              disabled={loading}
            />

            <button
              onClick={handleManualConvert}
              disabled={loading || !manualTranscript.trim()}
              className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Создать статью из транскрипта
                </>
              )}
            </button>
          </div>
        )}

        {/* Transcript Preview */}
        {transcript && !article && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📄 Исходный транскрипт
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {transcript.substring(0, 500)}...
              </p>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Показано первые 500 символов из {transcript.length}
            </p>
          </div>
        )}

        {/* Article Section */}
        {article && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                ✨ Готовая статья
              </h2>
              <button
                onClick={downloadArticle}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                <Download className="w-4 h-4" />
                Скачать .md
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: article
                    .replace(/^### /gm, '<h3 class="text-lg font-bold mt-4 mb-2">')
                    .replace(/^## /gm, '<h2 class="text-xl font-bold mt-6 mb-3">')
                    .replace(/^# /gm, '<h1 class="text-2xl font-bold mt-8 mb-4">')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n\n/g, '</p><p class="mb-3">')
                    .replace(/^(?!<h|<p)(.+)$/gm, '<p class="mb-3">$1</p>')
                }}
              />
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Автоматический режим требует backend API • Ручной режим работает всегда</p>
          <p className="mt-1">Полностью бесплатно • Без регистрации</p>
        </div>
      </div>
    </div>
  );
}
