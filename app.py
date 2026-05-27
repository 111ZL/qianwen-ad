"""
阿里云千问大模型互动广告 - 「一人公司·超级个体」
后端服务：Python Flask
功能：API 代理调用阿里云百炼平台，提供文本生成和图片生成接口
"""

import os
import json
import time
import threading
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import urllib.request
import urllib.error

load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

PORT = int(os.getenv('PORT', 3000))
DASHSCOPE_API_KEY = os.getenv('DASHSCOPE_API_KEY', '')

# -------------------------------------------------------------------
# 简易频率限制（每 IP 10 秒最多 1 次）
# -------------------------------------------------------------------
rate_limit_store = {}
rate_limit_lock = threading.Lock()

def check_rate_limit(ip):
    """检查频率限制，返回 (是否允许, 剩余秒数)"""
    now = time.time()
    with rate_limit_lock:
        if ip in rate_limit_store:
            elapsed = now - rate_limit_store[ip]
            if elapsed < 10:
                return False, int(10 - elapsed)
        rate_limit_store[ip] = now
        # 清理过期记录
        expired = [k for k, v in rate_limit_store.items() if now - v > 60]
        for k in expired:
            del rate_limit_store[k]
        return True, 0

# -------------------------------------------------------------------
# 降级/演示内容
# -------------------------------------------------------------------
FALLBACK_CONTENT = {
    'copywriting': {
        'title': '智能手表广告文案',
        'content': (
            '【时刻互联，智在腕间】\n\n'
            '标题：这一刻，与世界同频\n\n'
            '正文：\n'
            '在快节奏的都市生活中，你需要一个懂你的伙伴。\n'
            '全新 X-Watch Pro，搭载 AI 智能助手，\n'
            '无论是健康监测、消息速递，还是移动支付，\n'
            '一抬手腕，尽在掌握。\n\n'
            '✨ 核心卖点：\n'
            '• 7×24 心率血氧双监测，健康数据实时同步\n'
            '• eSIM 独立通话，运动无需带手机\n'
            '• 100+ 运动模式，专业级运动分析\n'
            '• 14 天超长续航，告别充电焦虑\n\n'
            '这一刻，与世界同频。\n'
            'X-Watch Pro — 你的 AI 智能腕上助理。'
        ),
        'tag': '本内容由千问大模型生成（示例效果）'
    },
    'operations': {
        'title': '新消费品牌「宠物咖啡」社交媒体运营方案',
        'content': (
            '【宠物咖啡 · 30天社交媒体运营方案】\n\n'
            '📊 数据分析洞察：\n'
            '• 目标用户：25-35岁城市白领，宠物主占比68%\n'
            '• 最佳发布时段：工作日 12:00-14:00、19:00-22:00\n'
            '• 热门话题：#宠物友好 #咖啡探店 #治愈系\n\n'
            '📅 Week 1-2：品牌冷启动\n'
            '• 抖音：3条「宠物+咖啡」治愈短视频（预计曝光 5-10w）\n'
            '• 小红书：5篇探店笔记，搭配「宠物友好咖啡地图」话题\n'
            '• 微信：社群裂变，「带宠到店享首杯半价」\n\n'
            '📅 Week 3-4：爆发增长\n'
            '• KOL 合作：3位宠物领域达人探店种草\n'
            '• UGC 活动：#我家毛孩子的咖啡时光# 话题挑战\n'
            '• 线下联动：「流浪动物领养日」公益合作\n\n'
            '📈 预期效果：月曝光 200w+，到店转化率提升 35%'
        ),
        'tag': '本内容由千问大模型生成（示例效果）'
    },
    'art': {
        'title': '智能手表科技感海报',
        'description': (
            '（图片生成演示）\n\n'
            '这是一幅科技感海报效果图：\n'
            '深蓝渐变背景，中央悬浮着智能手表产品图，\n'
            '周围环绕着发光的科技线条和数据可视化元素，\n'
            '底部白色大字标题"时刻互联"，\n'
            '整体风格简洁、高端、充满未来感。\n\n'
            '—— 图片生成功能需配置 API Key 后启用 ——'
        ),
        'tag': '本内容由千问大模型生成（示例效果 / 图片生成待启用）'
    }
}

# -------------------------------------------------------------------
# 工具函数：调用 DashScope qwen-max 文本生成
# -------------------------------------------------------------------
def call_qwen_text(prompt):
    """调用千问 qwen-max 模型进行文本生成"""
    url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {DASHSCOPE_API_KEY}'
    }
    body = {
        'model': 'qwen-max',
        'messages': [
            {
                'role': 'system',
                'content': '你是一个专业的AI助手，是「一人公司」的超级员工。请根据用户的指令，生成高质量、可直接使用的专业内容。回答简洁有力，格式清晰，适合直接在广告/营销场景使用。'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'temperature': 0.8,
        'max_tokens': 2000
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        raise Exception(f'API_ERROR: {e.code} - {e.read().decode("utf-8", errors="ignore")}')
    except Exception as e:
        raise Exception(f'API_ERROR: {str(e)}')

# -------------------------------------------------------------------
# 工具函数：调用 DashScope wanx 图片生成
# -------------------------------------------------------------------
def call_wanx_image(prompt):
    """调用千问 wanx 模型进行文生图"""
    # 第一步：提交异步任务
    submit_url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {DASHSCOPE_API_KEY}',
        'X-DashScope-Async': 'enable'
    }
    body = {
        'model': 'wanx2.1-t2i-turbo',
        'input': {'prompt': prompt},
        'parameters': {'size': '1024*1024', 'n': 1}
    }

    req = urllib.request.Request(
        submit_url,
        data=json.dumps(body).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            task_id = data.get('output', {}).get('task_id')
            if not task_id:
                raise Exception('IMAGE_TASK_FAILED: 未获取到任务ID')
    except urllib.error.HTTPError as e:
        raise Exception(f'IMAGE_API_ERROR: {e.code}')
    except Exception as e:
        raise Exception(f'IMAGE_API_ERROR: {str(e)}')

    # 第二步：轮询结果（最多等待 60 秒）
    query_url = f'https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}'
    for _ in range(20):
        time.sleep(3)
        req2 = urllib.request.Request(query_url, headers={'Authorization': f'Bearer {DASHSCOPE_API_KEY}'})
        try:
            with urllib.request.urlopen(req2, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                status = data.get('output', {}).get('task_status')
                if status == 'SUCCEEDED':
                    image_url = data.get('output', {}).get('results', [{}])[0].get('url')
                    if image_url:
                        return image_url
                    raise Exception('IMAGE_RESULT_EMPTY: 图片生成成功但未返回URL')
                if status == 'FAILED':
                    msg = data.get('output', {}).get('message', '未知错误')
                    raise Exception(f'IMAGE_TASK_FAILED: {msg}')
        except Exception:
            continue

    raise Exception('IMAGE_TIMEOUT: 图片生成超时，请稍后重试')

# -------------------------------------------------------------------
# API 路由
# -------------------------------------------------------------------

@app.route('/')
def index():
    """主页"""
    return send_from_directory('public', 'index.html')

@app.route('/api/health')
def health():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'apiKeyConfigured': bool(DASHSCOPE_API_KEY),
        'mode': 'production' if DASHSCOPE_API_KEY else 'demo'
    })

@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    """文本生成接口（qwen-max）"""
    ip = request.remote_addr or 'unknown'
    allowed, remaining = check_rate_limit(ip)
    if not allowed:
        return jsonify({
            'success': False,
            'error': f'请求太频繁，请 {remaining} 秒后再试',
            'fallback': True
        }), 429

    data = request.get_json(silent=True) or {}
    prompt = (data.get('prompt') or '').strip()

    if not prompt:
        return jsonify({'success': False, 'error': '请输入有效的指令'}), 400

    # 未配置 API Key → 降级
    if not DASHSCOPE_API_KEY:
        print('[DEMO] API Key not configured, returning fallback content')
        return jsonify({
            'success': True,
            'content': FALLBACK_CONTENT['copywriting']['content'],
            'tag': '本内容由千问大模型生成（演示模式：未配置 API Key）',
            'fallback': True
        })

    try:
        print(f'[Text-Gen] Request: "{prompt[:50]}..."')
        result = call_qwen_text(prompt)
        print(f'[Text-Gen] Success, length: {len(result)}')
        return jsonify({
            'success': True,
            'content': result,
            'tag': '本内容由千问大模型生成',
            'fallback': False
        })
    except Exception as e:
        print(f'[Text-Gen] Failed: {e}')
        return jsonify({
            'success': True,
            'content': FALLBACK_CONTENT['copywriting']['content'],
            'tag': '体验人数较多，这是示例效果（实际千问API可生成更精彩内容）',
            'fallback': True,
            'error_detail': str(e)
        })

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """图片生成接口（wanx 模型）"""
    ip = request.remote_addr or 'unknown'
    allowed, remaining = check_rate_limit(ip)
    if not allowed:
        return jsonify({
            'success': False,
            'error': f'请求太频繁，请 {remaining} 秒后再试',
            'fallback': True
        }), 429

    data = request.get_json(silent=True) or {}
    prompt = (data.get('prompt') or '').strip()

    if not prompt:
        return jsonify({'success': False, 'error': '请输入有效的图片描述'}), 400

    # 未配置 API Key → 降级
    if not DASHSCOPE_API_KEY:
        print('[DEMO] API Key not configured, returning image fallback')
        return jsonify({
            'success': True,
            'fallback': True,
            'description': FALLBACK_CONTENT['art']['description'],
            'tag': '图片生成功能需配置 API Key 后启用（演示模式）',
            'message': '演示模式：请配置 DASHSCOPE_API_KEY 以启用真实图片生成'
        })

    try:
        print(f'[Image-Gen] Request: "{prompt[:50]}..."')
        image_url = call_wanx_image(prompt)
        print(f'[Image-Gen] Success: {image_url}')
        return jsonify({
            'success': True,
            'imageUrl': image_url,
            'tag': '本图片由千问大模型（wanx）生成',
            'fallback': False
        })
    except Exception as e:
        print(f'[Image-Gen] Failed: {e}')
        return jsonify({
            'success': True,
            'fallback': True,
            'description': FALLBACK_CONTENT['art']['description'],
            'tag': '体验人数较多，图片生成暂时降级（示例效果）',
            'error_detail': str(e)
        })

# -------------------------------------------------------------------
# 启动
# -------------------------------------------------------------------
if __name__ == '__main__':
    import sys
    # Fix Windows console encoding for emoji support
    if sys.platform == 'win32':
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    mode = '[PROD]' if DASHSCOPE_API_KEY else '[DEMO] (configure API Key)'
    print('=' * 60)
    print('  AliCloud Qianwen - One Person Company Interactive Ad')
    print(f'  Server: http://localhost:{PORT}')
    print(f'  Mode: {mode}')
    print('  One Person Company, Powered by Qianwen')
    print('=' * 60)
    app.run(host='0.0.0.0', port=PORT, debug=False)
