/**
 * AI Service
 * Handles integration with Groq API for intelligent search suggestions
 */

import Groq from 'groq-sdk';
import { config } from '../config/index.js';

// Initialize Groq client
let groqClient = null;

/**
 * Get or create Groq client instance
 * @returns {Object} Groq client instance
 */
const getGroqClient = () => {
  if (!groqClient && config.groqApiKey) {
    groqClient = new Groq({ apiKey: config.groqApiKey });
  }
  return groqClient;
};

/**
 * Generate AI suggestions for code snippets based on search results
 * @param {string} userQuery - The user's search query
 * @param {Array} searchResults - Array of code snippets from database
 * @returns {Promise<Object>} AI suggestions and analysis
 */
export const generateAISuggestions = async (userQuery, searchResults) => {
  const client = getGroqClient();
  
  // If no API key is configured, return a placeholder response
  if (!client) {
    return {
      available: false,
      message: 'AI suggestions are not available. Configure GROQ_API_KEY to enable.',
      suggestions: null
    };
  }

  try {
    // Prepare the context from search results
    const snippetsContext = searchResults.slice(0, 5).map((snippet, index) => `
### Snippet ${index + 1}: ${snippet.title}
**Language:** ${snippet.language}
**Tags:** ${snippet.tags.join(', ')}
**Rating:** ${snippet.ratings.average}/5 (${snippet.ratings.count} ratings)
**Description:** ${snippet.description}

\`\`\`${snippet.language}
${snippet.code.substring(0, 500)}${snippet.code.length > 500 ? '...' : ''}
\`\`\`
`).join('\n');

    // Create the prompt for AI analysis
    const prompt = `You are an expert code reviewer and programming assistant. 
Your task is to analyze code snippets and provide helpful suggestions.
Be concise, practical, and focus on actionable improvements.

User is searching for: "${userQuery}"

Here are the code snippets found in the database:

${snippetsContext || 'No snippets found matching the query.'}

Please analyze these results and provide:
1. A brief summary of what was found
2. Which snippet best matches the user's intent and why
3. Specific improvements for each snippet
4. Missing edge cases that should be handled
5. Alternative approaches the user might consider
6. A suggestion for a new snippet that would better serve this query (if applicable)

Return your analysis as valid JSON only (no markdown code blocks), with the following structure:
{
  "summary": "Brief summary of the search results",
  "bestMatch": {
    "index": <number of best matching snippet, 1-indexed>,
    "reason": "Why this is the best match"
  },
  "improvements": [
    {
      "snippetIndex": <1-indexed>,
      "suggestion": "Specific improvement suggestion",
      "priority": "high|medium|low"
    }
  ],
  "missingEdgeCases": [
    "Edge case 1 description",
    "Edge case 2 description"
  ],
  "alternativeApproaches": [
    {
      "approach": "Description of alternative approach",
      "tradeoffs": "Pros and cons"
    }
  ],
  "additionalSnippetSuggestion": {
    "title": "Suggested new snippet title",
    "description": "What this snippet would do",
    "pseudocode": "Brief pseudocode or key logic"
  }
}`;

    // Call Groq API
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '';
    
    try {
      // Attempt to parse as JSON (remove any markdown code blocks if present)
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanedResponse);
      
      return {
        available: true,
        suggestions: parsedResponse,
        usage: {
          model: 'llama-3.3-70b-versatile',
          provider: 'groq'
        }
      };
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      console.warn('Failed to parse AI response as JSON:', parseError.message);
      return {
        available: true,
        suggestions: {
          summary: aiResponse,
          raw: true
        },
        usage: {
          model: 'llama-3.3-70b-versatile',
          provider: 'groq'
        }
      };
    }

  } catch (error) {
    console.error('AI Service Error:', error.message);
    
    // Parse error for user-friendly message
    let userMessage = 'AI suggestions temporarily unavailable';
    
    if (error.message.includes('429') || error.message.includes('rate')) {
      userMessage = 'AI suggestions temporarily unavailable: Rate limit exceeded. Please try again in a few seconds.';
    } else if (error.message.includes('401') || error.message.includes('API key')) {
      userMessage = 'AI suggestions unavailable: Invalid API key. Please check your GROQ_API_KEY.';
    } else if (error.message.includes('404')) {
      userMessage = 'AI suggestions unavailable: Model not found.';
    }
    
    // Return error info without crashing the search
    return {
      available: false,
      message: userMessage,
      suggestions: null
    };
  }
};

/**
 * Generate a code snippet based on natural language description
 * @param {string} description - Natural language description
 * @param {string} language - Target programming language
 * @returns {Promise<Object>} Generated code snippet
 */
export const generateCodeSnippet = async (description, language) => {
  const client = getGroqClient();
  
  if (!client) {
    return {
      available: false,
      message: 'Code generation is not available. Configure GROQ_API_KEY to enable.'
    };
  }

  try {
    const prompt = `You are an expert programmer. Generate a clean, well-commented ${language} code snippet for: ${description}

Return JSON only (no markdown code blocks) with this structure:
{ "title": "", "code": "", "description": "", "tags": [] }`;

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '';
    
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      return {
        available: true,
        generated: JSON.parse(cleanedResponse),
        usage: { model: 'llama-3.3-70b-versatile', provider: 'groq' }
      };
    } catch {
      return {
        available: true,
        generated: { code: aiResponse, title: description, description, tags: [] },
        usage: { model: 'llama-3.3-70b-versatile', provider: 'groq' }
      };
    }
  } catch (error) {
    console.error('Code generation error:', error.message);
    return {
      available: false,
      message: `Code generation failed: ${error.message}`
    };
  }
};

export default {
  generateAISuggestions,
  generateCodeSnippet
};
