import React from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { MeetingMinutes, ChatSummary } from '../../services/groqService';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  meetingMinutes?: MeetingMinutes;
  chatSummary?: ChatSummary;
  onRegenerate: () => void;
}

const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  onClose,
  title,
  isLoading,
  meetingMinutes,
  chatSummary,
  onRegenerate,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    let content = '';
    let filename = '';

    if (meetingMinutes) {
      content = `
# ${meetingMinutes.title}
Date: ${meetingMinutes.date}

## Participants
${meetingMinutes.participants.map(p => `- ${p}`).join('\n')}

## Summary
${meetingMinutes.summary}

## Key Points
${meetingMinutes.keyPoints.map(point => `- ${point}`).join('\n')}

## Action Items
${meetingMinutes.actionItems.map(item => `- ${item}`).join('\n')}
      `;
      filename = `${meetingMinutes.title.replace(/\s+/g, '_')}_minutes.md`;
    } else if (chatSummary) {
      content = `
# Chat Summary

## Summary
${chatSummary.summary}

## Key Topics
${chatSummary.keyTopics.map(topic => `- ${topic}`).join('\n')}

## Sentiment
${chatSummary.sentiment}
      `;
      filename = 'chat_summary.md';
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Regenerate"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading || (!meetingMinutes && !chatSummary)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Generating AI summary...</p>
          </div>
        ) : meetingMinutes ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Participants</h3>
              <div className="flex flex-wrap gap-2">
                {meetingMinutes.participants.map((participant, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-gray-700">{meetingMinutes.summary}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Key Points</h3>
              <ul className="list-disc pl-5 space-y-1">
                {meetingMinutes.keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Action Items</h3>
              <ul className="list-disc pl-5 space-y-1">
                {meetingMinutes.actionItems.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : chatSummary ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-gray-700">{chatSummary.summary}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {chatSummary.keyTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Sentiment</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  chatSummary.sentiment === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : chatSummary.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {chatSummary.sentiment.charAt(0).toUpperCase() + chatSummary.sentiment.slice(1)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No summary available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummaryModal; 