"""
API Key verification & text generation test
"""
import json
import sys
import urllib.request
import urllib.error

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

API_KEY = "sk-d2f62404a7af42fdb6ff02fd552e49cf"

def test_qwen_text(prompt):
    url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    body = {
        "model": "qwen-max",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "max_tokens": 500
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        print("[Request] Sending to qwen-max...")
        print(f"[Prompt] {prompt}")
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            result = data["choices"][0]["message"]["content"]
            print("\n[SUCCESS] API Key is valid! Response:\n")
            print("-" * 60)
            print(result)
            print("-" * 60)
            tokens = data.get("usage", {}).get("total_tokens", "N/A")
            print(f"\n[Tokens] {tokens}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        print(f"\n[FAIL] HTTP {e.code}")
        print(f"[Error] {error_body}")
        return False
    except Exception as e:
        print(f"\n[FAIL] Network error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  Aliyun Bailian API Key Verification")
    print(f"  Key: {API_KEY[:12]}...{API_KEY[-4:]}")
    print("=" * 60)
    print()

    success = test_qwen_text(
        "用一句话介绍千问大模型的核心能力，50字以内。"
    )

    if success:
        print("\n[PASS] API Key configured correctly, text generation works.")
    else:
        print("\n[FAIL] Please check your API Key and account balance.")
