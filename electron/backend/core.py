import os
import sys
import argparse
from model import extract_key_information
import json
from numba import NumbaDeprecationWarning
import warnings

warnings.filterwarnings('ignore', category=NumbaDeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning, message="FP16 is not supported on CPU; using FP32 instead")


def resource_path(relative_path: str) -> str:
    """ Get the absolute path for a resource in a PyInstaller executable or a regular Python script. """
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


def parse_arguments():
    """
    Parse command line arguments.

    Returns:
        argparse.Namespace: Parsed command line arguments.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("-t", "--transcript", help="The path to the audio file to transcribe.")
    parser.add_argument("-k", "--key-information", help="The number of terms to return.", type=int)
    return parser.parse_args()


def main():
    """
    Main function to extract key information from an audio transcript.
    """
    # Path adjustments
    ffmpeg_path = resource_path('ffmpeg.exe')
    ffprobe_path = resource_path('ffprobe.exe')
    mel_filters_path = resource_path('whisper/assets/mel_filters.npz')
    gpt2_token_path = resource_path('whisper/assets/gpt2.tiktoken')
    multilingual_token_path = resource_path('whisper/assets/multilingual.tiktoken')

    
    # Modify any library calls in your code that rely on these paths
    # For instance, if you have a method that loads mel_filters, you'd pass mel_filters_path to it.
    
    # Ensure the directory containing ffmpeg and ffprobe is in the PATH for this application's context.
    os.environ["PATH"] += os.pathsep + os.path.dirname(ffmpeg_path)

    # Your regular application logic
    args = parse_arguments()
    information = extract_key_information(args.transcript)

    # Convert the information to JSON and print it
    print(json.dumps(information))


if __name__ == "__main__":
    main()
