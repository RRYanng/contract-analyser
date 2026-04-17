import os
import json
import anthropic

_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def ask_claude(prompt: str, max_tokens: int = 2048) -> str:
    client = get_client()
    model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    message = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def ask_claude_json(prompt: str, max_tokens: int = 2048) -> dict:
    raw = ask_claude(prompt, max_tokens)
    # Strip accidental markdown fences
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    return json.loads(cleaned.strip())
