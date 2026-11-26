import Anthropic from '@anthropic-ai/sdk';

const MODEL = "claude-opus-5-5";

// If a request is declined by a safety classifier, the API retries it on a
// fallback model inside the same call.
const FALLBACK: Pick<Anthropic.Beta.MessageCreateParamsNonStreaming, "betas" | "fallbacks"> = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** The text of a reply. Replies can start with thinking blocks, so find the text block. */
function replyText(response: Anthropic.Beta.BetaMessage): string | null {
  if (response.stop_reason === "refusal") return null;
  const block = response.content.find(
    (b): b is Anthropic.Beta.BetaTextBlock => b.type === "text",
  );
  return block?.text ?? null;
}

export interface ReceiptData {
  merchant?: string;
  date?: string;
  total?: number;
  tax?: number;
  subtotal?: number;
  items?: Array<{
    description: string;
    amount: number;
  }>;
  category?: string;
  paymentMethod?: string;
  address?: string;
}

export class AIService {
  async analyzeReceiptImage(base64Image: string): Promise<ReceiptData> {
    try {
      const response = await anthropic.beta.messages.create({
        ...FALLBACK,
        model: MODEL,
        max_tokens: 16000,
        // Reading a receipt is a simple extraction
        output_config: { effort: "low" },
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the key information. Return ONLY a JSON object with this exact structure (use null for missing values):

{
  "merchant": "store name",
  "date": "YYYY-MM-DD format",
  "total": number,
  "tax": number,
  "subtotal": number,
  "items": [{"description": "item name", "amount": number}],
  "category": "best guess category like 'Office Supplies', 'Meals', 'Travel', 'Equipment', etc.",
  "paymentMethod": "cash/card/check if visible",
  "address": "store address if visible"
}

Extract all visible amounts as numbers. For date, convert to YYYY-MM-DD format. For category, choose the most appropriate business expense category based on the merchant and items.`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      });

      const text = replyText(response);
      // Extract JSON from the response text
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Failed to parse receipt data from AI response');
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw new Error('Failed to analyze receipt image');
    }
  }

  async categorizeExpense(description: string, merchant?: string): Promise<string> {
    try {
      const response = await anthropic.beta.messages.create({
        ...FALLBACK,
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "low" },
        messages: [{
          role: "user",
          content: `Categorize this business expense into one of these categories: Office Supplies, Meals, Travel, Equipment, Marketing, Professional Services, Utilities, Insurance, Software, Other.

Description: ${description}
Merchant: ${merchant || 'Unknown'}

Return only the category name.`
        }]
      });

      return replyText(response)?.trim() || 'Other';
    } catch (error) {
      console.error('Error categorizing expense:', error);
      return 'Other';
    }
  }
}

export const aiService = new AIService();