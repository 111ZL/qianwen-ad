"""
Vercel Serverless 入口 — Flask 应用适配
"""
import os
import json
import time
import sys
import threading
import urllib.request
import urllib.error

from flask import Flask, request, jsonify

# ----------------------------------------------------------------
# 配置
# ----------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, 'public')

DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY', '')
PORT = int(os.getenv('PORT', 3000))

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')

# ----------------------------------------------------------------
# 频率限制
# ----------------------------------------------------------------
rate_limit_store = {}
rate_limit_lock = threading.Lock()

def check_rate_limit(ip):
    now = time.time()
    with rate_limit_lock:
        if ip in rate_limit_store:
            elapsed = now - rate_limit_store[ip]
            if elapsed < 10:
                return False, int(10 - elapsed)
        rate_limit_store[ip] = now
        expired = [k for k, v in rate_limit_store.items() if now - v > 60]
        for k in expired:
            del rate_limit_store[k]
        return True, 0

# ----------------------------------------------------------------
# 降级内容
# ----------------------------------------------------------------
FALLBACK = (
    '【时刻互联，智在腕间】\n\n'
    '标题：这一刻，与世界同频\n\n'
    '正文：\n'
    '在快节奏的都市生活中，你需要一个懂你的伙伴。\n'
    '全新 X-Watch Pro，搭载 AI 智能助手，\n'
    '无论是健康监测、消息速递，还是移动支付，\n'
    '一抬手腕，尽在掌握。\n\n'
    '核心卖点：\n'
    '• 7x24 心率血氧双监测\n'
    '• eSIM 独立通话\n'
    '• 14天超长续航\n\n'
    'X-Watch Pro — 你的 AI 智能腕上助理。'
)

ART_FALLBACK = (
    '（图片生成演示）\n\n'
    '这是一幅科技感海报效果图：深蓝渐变背景，\n'
    '中央悬浮着智能手表产品图，\n'
    '周围环绕着发光的科技线条和数据可视化元素。\n\n'
    '—— 图片生成功能需配置 API Key 后启用 ——'
)

# ----------------------------------------------------------------
# 千问 API 调用
# ----------------------------------------------------------------
def call_qwen_text(prompt):
    url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {DASHSCOPE_API_KEY}'
    }
    body = {
        'model': 'qwen-max',
        'messages': [
            {'role': 'system', 'content': '你是一个专业的AI助手，是「一人公司」的超级员工。请根据用户的指令，生成高质量、可直接使用的专业内容。'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.8,
        'max_tokens': 2000
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        raise Exception(f'API_ERROR: {e.code}')
    except Exception as e:
        raise Exception(f'API_ERROR: {str(e)}')

def call_wanx_image(prompt):
    submit_url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {DASHSCOPE_API_KEY}', 'X-DashScope-Async': 'enable'}
    body = {'model': 'wanx2.1-t2i-turbo', 'input': {'prompt': prompt}, 'parameters': {'size': '1024*1024', 'n': 1}}
    req = urllib.request.Request(submit_url, data=json.dumps(body).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            task_id = data.get('output', {}).get('task_id')
            if not task_id:
                raise Exception('IMAGE_TASK_FAILED')
    except Exception as e:
        raise Exception(f'IMAGE_API_ERROR: {str(e)}')

    for _ in range(20):
        time.sleep(3)
        req2 = urllib.request.Request(f'https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}', headers={'Authorization': f'Bearer {DASHSCOPE_API_KEY}'})
        try:
            with urllib.request.urlopen(req2, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                status = data.get('output', {}).get('task_status')
                if status == 'SUCCEEDED':
                    url = data.get('output', {}).get('results', [{}])[0].get('url')
                    if url: return url
                if status == 'FAILED':
                    raise Exception('IMAGE_TASK_FAILED')
        except:
            continue
    raise Exception('IMAGE_TIMEOUT')

# ----------------------------------------------------------------
# API 路由
# ----------------------------------------------------------------
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'apiKeyConfigured': bool(DASHSCOPE_API_KEY),
        'mode': 'production' if DASHSCOPE_API_KEY else 'demo'
    })

@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    ip = request.headers.get('x-forwarded-for', request.remote_addr or 'unknown')
    allowed, remaining = check_rate_limit(ip)
    if not allowed:
        return jsonify({'success': False, 'error': f'Rate limit, try again in {remaining}s', 'fallback': True}), 429

    data = request.get_json(silent=True) or {}
    prompt = (data.get('prompt') or '').strip()
    if not prompt:
        return jsonify({'success': False, 'error': 'Prompt required'}), 400

    if not DASHSCOPE_API_KEY:
        return jsonify({'success': True, 'content': FALLBACK, 'tag': 'Demo mode', 'fallback': True})

    try:
        result = call_qwen_text(prompt)
        return jsonify({'success': True, 'content': result, 'tag': 'Generated by Qianwen', 'fallback': False})
    except Exception as e:
        return jsonify({'success': True, 'content': FALLBACK, 'tag': 'Fallback content', 'fallback': True, 'error_detail': str(e)})

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    ip = request.headers.get('x-forwarded-for', request.remote_addr or 'unknown')
    allowed, remaining = check_rate_limit(ip)
    if not allowed:
        return jsonify({'success': False, 'error': f'Rate limit, try again in {remaining}s', 'fallback': True}), 429

    data = request.get_json(silent=True) or {}
    prompt = (data.get('prompt') or '').strip()
    if not prompt:
        return jsonify({'success': False, 'error': 'Prompt required'}), 400

    if not DASHSCOPE_API_KEY:
        return jsonify({'success': True, 'fallback': True, 'description': ART_FALLBACK, 'tag': 'Demo mode'})

    try:
        image_url = call_wanx_image(prompt)
        return jsonify({'success': True, 'imageUrl': image_url, 'tag': 'Generated by Qianwen', 'fallback': False})
    except Exception as e:
        return jsonify({'success': True, 'fallback': True, 'description': ART_FALLBACK, 'tag': 'Fallback', 'error_detail': str(e)})

# ----------------------------------------------------------------
# 本地运行
# ----------------------------------------------------------------
if __name__ == '__main__':
    import sys
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    mode = '[PROD]' if DASHSCOPE_API_KEY else '[DEMO]'
    print('=' * 60)
    print(f'  Qianwen Ad Server - http://localhost:{PORT}')
    print(f'  Mode: {mode}')
    print('=' * 60)
    app.run(host='0.0.0.0', port=PORT, debug=False)
