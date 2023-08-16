# model.py
import sklearn.feature_extraction.text as tfidf
import whisper
from stopwords import GERMAN_STOP_WORDS, ENGLISH_STOP_WORDS
import rake_nltk

class KeyPhrasesExtractor:
    """Class to extract key phrases using RAKE (Rapid Automatic Keyword Extraction)."""

    def __init__(self):
        self.rake = rake_nltk.Rake()

    def extract(self, text, num_phrases=5):
        """
        Extract key phrases from the given text.

        Args:
            text (str): The input text.
            num_phrases (int, optional): The number of key phrases to extract. Defaults to 5.

        Returns:
            list: List of key phrases.
        """
        self.rake.extract_keywords_from_text(text)
        key_phrases = self.rake.get_ranked_phrases()[:num_phrases]
        return key_phrases
    
def extract_key_information(transcript):
    """
    Extract key information from the audio transcript.

    Args:
        transcript (str): The audio transcript.

    Returns:
        dict: A dictionary containing the transcript, key terms, and key phrases.
    """
    # Transcribe the audio file.
    model = whisper.load_model("small")
    result = model.transcribe(transcript)
    transcript = result["text"]

    # Split the transcript into sentences.
    sentences = transcript.split('. ')  # Split by sentences based on the assumption of a period followed by a space.

    # Remove English and German stopwords.
    custom_stopwords = GERMAN_STOP_WORDS + ENGLISH_STOP_WORDS
    filtered_sentences = []
    for sentence in sentences:
        filtered_sentence = [word for word in sentence.split() if word.lower() not in custom_stopwords]
        filtered_sentences.append(" ".join(filtered_sentence))

    # Calculate the TF-IDF scores for each term in the transcript.
    tfidf_vectorizer = tfidf.TfidfVectorizer()
    tfidf_matrix = tfidf_vectorizer.fit_transform(filtered_sentences)

    # Get the terms with the highest TF-IDF scores.
    feature_names = tfidf_vectorizer.get_feature_names_out()
    sorted_scores = sorted(zip(tfidf_matrix.toarray()[0], feature_names), reverse=True)

    # Get the top 10 terms.
    top_10_terms = [term for score, term in sorted_scores[:10]]

    # Extract key phrases from the transcript.
    key_phrases_extractor = KeyPhrasesExtractor()
    key_phrases = key_phrases_extractor.extract(transcript, num_phrases=5)

    # Return the top 10 terms, key phrases, and the full transcript.
    return {
        "transcript": transcript,
        "key_terms": ["* " + term for term in top_10_terms],
        "key_phrases": key_phrases
    }


