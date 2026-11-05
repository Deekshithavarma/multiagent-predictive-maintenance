const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

// Atlas model keys (al-...) authenticate against ai.mongodb.com.
// Voyage dashboard keys (pa-...) authenticate against api.voyageai.com.
// Sending either key to the other host returns 403.
function getVoyageEmbeddingsUrl(apiKey) {
  const base = apiKey?.startsWith("al-")
    ? "https://ai.mongodb.com/v1"
    : "https://api.voyageai.com/v1";
  return `${base}/embeddings`;
}

const VOYAGE_API_URL = getVoyageEmbeddingsUrl(VOYAGE_API_KEY);

/**
 * VoyageAI embeddings client using plain REST API calls.
 */
export class VoyageAIEmbeddings {
  /**
   * Generate an embedding for a given text using the VoyageAI API.
   * @param {string} text - The text to embed.
   * @param {object} [options] - Optional request body overrides (model, input_type, etc.).
   * @returns {Promise<Array<number>>} The embedding vector.
   */
  async generateEmbedding(text, options = {}) {
    const payload = {
      input: [text],
      model: EMBEDDING_MODEL,
      input_type: "query",
      ...options,
    };

    try {
      const response = await fetch(VOYAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VOYAGE_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `VoyageAI API request failed with status ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      return embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }
}