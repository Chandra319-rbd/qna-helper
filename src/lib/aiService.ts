import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

export interface AIAnalysisResult {
  category: string;
  relevanceScore: number;
  reason: string;
  draftAnswer: string;
}

export interface AIAnalysisOnly {
  category: string;
  relevanceScore: number;
  reason: string;
}

export async function analyzeQuestionOnly(question: string, topic?: string): Promise<AIAnalysisOnly> {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const systemPrompt = `You are an AI assistant helping instructors analyze student questions in Q&A sessions.

Your task is to:
1. Categorize the question type
2. Score its relevance (0-100)
3. Explain your reasoning

Categories:
- "important": Deep conceptual questions, misunderstandings that need clarification
- "creative": Questions showing curiosity, asking for examples or extensions
- "confused": Questions indicating confusion or misconceptions
- "basic": Simple factual questions or clarifications

Respond in JSON format:
{
  "category": "important|creative|confused|basic",
  "relevanceScore": 85,
  "reason": "Brief explanation of why this category and score"
}`;

  const userPrompt = `Question: "${question}"${topic ? `\nSession Topic: ${topic}` : ''}

Please analyze this student question and provide your assessment.`;

  try {
    const result = await generateText({
      model: openrouter('moonshotai/kimi-k2:free'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.4,
    });

    // Log raw AI response
    console.log('Raw AI Analysis Response:', result.text);

    // Clean the response - remove markdown code blocks if present
    let cleanedText = result.text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    const analysis = JSON.parse(cleanedText) as AIAnalysisOnly;
    
    // Log the AI response for debugging
    console.log('AI Analysis Response:', {
      question: question.substring(0, 100) + '...',
      topic,
      rawResponse: result.text,
      parsedAnalysis: analysis
    });
    
    // Validate the response
    if (!analysis.category || !analysis.relevanceScore || !analysis.reason) {
      throw new Error('Invalid AI response format');
    }

    // Ensure category is valid
    const validCategories = ['important', 'creative', 'confused', 'basic'];
    if (!validCategories.includes(analysis.category)) {
      analysis.category = 'basic';
    }

    // Ensure score is in valid range
    analysis.relevanceScore = Math.max(0, Math.min(100, analysis.relevanceScore));

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback response
    return {
      category: 'basic',
      relevanceScore: 50,
      reason: 'Unable to analyze question - using fallback categorization',
    };
  }
}

export async function generateDraftAnswer(question: string, topic?: string): Promise<string> {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const systemPrompt = `You are an AI assistant helping instructors generate draft answers for student questions.

Generate a helpful, educational draft answer that:
- Directly addresses the student's question
- Provides clear explanations
- Includes relevant examples when appropriate
- Maintains a supportive, encouraging tone
- Is concise but comprehensive

The instructor will review and refine this draft before responding to the student.`;

  const userPrompt = `Question: "${question}"${topic ? `\nSession Topic: ${topic}` : ''}

Generate a helpful draft answer for this student question.`;

  try {
    const result = await generateText({
      model: openrouter('moonshotai/kimi-k2:free'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.6,
    });

    // Log raw AI response
    console.log('Raw AI Draft Response:', result.text);

    // Log the AI response for debugging
    console.log('AI Draft Response:', {
      question: question.substring(0, 100) + '...',
      topic,
      rawResponse: result.text,
      draftLength: result.text.length
    });

    return result.text.trim();
  } catch (error) {
    console.error('AI draft generation error:', error);
    
    // Fallback response
    return `This is a placeholder draft answer for: "${question}". Please provide a helpful response based on your expertise.`;
  }
}
