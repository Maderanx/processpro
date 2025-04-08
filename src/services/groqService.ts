import axios from 'axios';

// Define types for our AI responses
export interface MeetingMinutes {
  title: string;
  date: string;
  participants: string[];
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

export interface ChatSummary {
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface VideoMeetingData {
  title: string;
  date: string;
  duration: string;
  participants: string[];
  recordingUrl?: string;
}

export interface NotificationContent {
  title: string;
  description: string;
  type: 'mention' | 'meeting' | 'deadline' | 'update';
}

// Initialize the Groq API client
const groqApi = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
  },
});

// Function to generate meeting minutes from chat messages
export const generateMeetingMinutes = async (
  messages: { content: string; senderId: string; senderName: string; createdAt: string }[],
  groupName: string
): Promise<MeetingMinutes> => {
  try {
    // Format messages for the prompt
    const formattedMessages = messages.map(msg => 
      `${msg.senderName} (${new Date(msg.createdAt).toLocaleTimeString()}): ${msg.content}`
    ).join('\n');
    
    // Create the prompt for meeting minutes
    const prompt = `
      Please generate meeting minutes for the following conversation in the group "${groupName}".
      Format the response as a JSON object with the following structure:
      {
        "title": "Meeting Title",
        "date": "Current Date",
        "participants": ["List of participant names"],
        "summary": "A brief summary of the meeting",
        "keyPoints": ["Key points discussed"],
        "actionItems": ["Action items or next steps"]
      }
      
      Conversation:
      ${formattedMessages}
    `;
    
    // Call the Groq API
    const response = await groqApi.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates meeting minutes from conversations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Extract the JSON response
    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse meeting minutes JSON');
    }
  } catch (error) {
    console.error('Error generating meeting minutes:', error);
    throw error;
  }
};

// Function to generate meeting minutes from video meeting data
export const generateVideoMeetingMinutes = async (
  meetingData: VideoMeetingData
): Promise<MeetingMinutes> => {
  try {
    // Create the prompt for video meeting minutes
    const prompt = `
      Please generate meeting minutes for the following video meeting.
      Format the response as a JSON object with the following structure:
      {
        "title": "Meeting Title",
        "date": "Meeting Date",
        "participants": ["List of participant names"],
        "summary": "A brief summary of the meeting",
        "keyPoints": ["Key points discussed"],
        "actionItems": ["Action items or next steps"]
      }
      
      Meeting Information:
      Title: ${meetingData.title}
      Date: ${meetingData.date}
      Duration: ${meetingData.duration}
      Participants: ${meetingData.participants.join(', ')}
    `;
    
    // Call the Groq API
    const response = await groqApi.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates meeting minutes from video meeting information.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Extract the JSON response
    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse video meeting minutes JSON');
    }
  } catch (error) {
    console.error('Error generating video meeting minutes:', error);
    throw error;
  }
};

// Function to generate a chat summary
export const generateChatSummary = async (
  messages: { content: string; senderId: string; senderName: string; createdAt: string }[],
  chatName: string
): Promise<ChatSummary> => {
  try {
    // Format messages for the prompt
    const formattedMessages = messages.map(msg => 
      `${msg.senderName} (${new Date(msg.createdAt).toLocaleTimeString()}): ${msg.content}`
    ).join('\n');
    
    // Create the prompt for chat summary
    const prompt = `
      Please generate a summary for the following conversation with "${chatName}".
      Format the response as a JSON object with the following structure:
      {
        "summary": "A brief summary of the conversation",
        "keyTopics": ["Key topics discussed"],
        "sentiment": "positive, neutral, or negative"
      }
      
      Conversation:
      ${formattedMessages}
    `;
    
    // Call the Groq API
    const response = await groqApi.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates summaries from conversations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    // Extract the JSON response
    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse chat summary JSON');
    }
  } catch (error) {
    console.error('Error generating chat summary:', error);
    throw error;
  }
};

// Function to generate notification content
export const generateNotificationContent = async (
  context: {
    type: 'mention' | 'meeting' | 'deadline' | 'update';
    data: any;
  }
): Promise<NotificationContent> => {
  try {
    let prompt = '';
    
    switch (context.type) {
      case 'mention':
        prompt = `
          Generate a notification for a mention in a chat.
          Format the response as a JSON object with the following structure:
          {
            "title": "New Mention",
            "description": "A brief description of the mention",
            "type": "mention"
          }
          
          Context:
          ${JSON.stringify(context.data)}
        `;
        break;
      case 'meeting':
        prompt = `
          Generate a notification for a meeting.
          Format the response as a JSON object with the following structure:
          {
            "title": "Meeting Reminder",
            "description": "A brief description of the meeting",
            "type": "meeting"
          }
          
          Context:
          ${JSON.stringify(context.data)}
        `;
        break;
      case 'deadline':
        prompt = `
          Generate a notification for a task deadline.
          Format the response as a JSON object with the following structure:
          {
            "title": "Deadline Reminder",
            "description": "A brief description of the deadline",
            "type": "deadline"
          }
          
          Context:
          ${JSON.stringify(context.data)}
        `;
        break;
      case 'update':
        prompt = `
          Generate a notification for a general update.
          Format the response as a JSON object with the following structure:
          {
            "title": "Update",
            "description": "A brief description of the update",
            "type": "update"
          }
          
          Context:
          ${JSON.stringify(context.data)}
        `;
        break;
    }
    
    // Call the Groq API
    const response = await groqApi.post('/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates notifications.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    
    // Extract the JSON response
    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse notification content JSON');
    }
  } catch (error) {
    console.error('Error generating notification content:', error);
    throw error;
  }
}; 