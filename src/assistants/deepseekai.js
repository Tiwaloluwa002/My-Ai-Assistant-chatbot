import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: import.meta.env.VITE_COHERE_API_KEY,
});

export class Assistant {
  constructor(model = "command") {
    this.model = model;
    this.client = cohere;
  }

  async chatStream(content, messages) {
    const response = await this.client.generate({
      model: this.model,
      prompt: content,
      max_tokens: 100,
    });

    // Simulate streaming by yielding chunks
    return [response.generations[0].text];
  }
}