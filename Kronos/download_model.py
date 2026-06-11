"""
Download the Kronos base 102.3M model and tokenizer from Hugging Face.

Run from the Kronos/ directory:
    python download_model.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from model import Kronos, KronosTokenizer

print("Downloading Kronos tokenizer (NeoQuasar/Kronos-Tokenizer-base)...")
tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-base")
print("Tokenizer downloaded.")

print("Downloading Kronos base model 102.3M (NeoQuasar/Kronos-base)...")
model = Kronos.from_pretrained("NeoQuasar/Kronos-base")
print("Model downloaded.")

param_count = sum(p.numel() for p in model.parameters())
print(f"Model loaded: {param_count:,} parameters")
print("Setup complete. Model and tokenizer are cached in ~/.cache/huggingface/hub/")
