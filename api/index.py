# Vercel Serverless 函数入口
# 导入 Flask 应用，适配 Vercel 的 Serverless 运行环境

import sys
import os

# 确保能找到 app.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel 自动识别名为 app 的 Flask 实例
