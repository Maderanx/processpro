import React, { useState, useRef } from 'react';
import { generateVideoMeetingMinutes, VideoMeetingData } from '../services/groqService';
import { useAuthStore } from '../store/auth';
import { Loader2, Video, Upload } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';

export default function AITools() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [videoMeetingData, setVideoMeetingData] = useState<VideoMeetingData>({
    title: '',
    date: '',
    duration: '',
    participants: [],
    recordingUrl: '',
  });

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoMeetingDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVideoMeetingData(prev => ({
      ...prev,
      [name]: name === 'participants' ? value.split(',').map(p => p.trim()) : value,
    }));
  };

  const handleGenerateVideoMeetingMinutes = async () => {
    if (
      !videoMeetingData.title ||
      !videoMeetingData.date ||
      !videoMeetingData.participants.length
    ) {
      setError('Please provide meeting title, date, and participants');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateVideoMeetingMinutes(videoMeetingData);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video meeting minutes');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoMeetingData(prev => ({
        ...prev,
        recordingUrl: url,
      }));
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Video Minutes</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Video className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">Video Meeting Minutes</h2>
          </div>

          {/* Video Upload Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Upload Meeting Recording</h3>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-48"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*"
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">
                Click to upload a video file
                <br />
                or drag and drop here
              </p>
              <p className="text-xs text-gray-400 mt-2">Supported formats: MP4, WebM, MOV</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
              <input
                type="text"
                name="title"
                value={videoMeetingData.title}
                onChange={handleVideoMeetingDataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={videoMeetingData.date}
                onChange={handleVideoMeetingDataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={videoMeetingData.duration}
                onChange={handleVideoMeetingDataChange}
                placeholder="e.g., 1 hour 30 minutes"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Participants (comma-separated)
              </label>
              <input
                type="text"
                name="participants"
                value={videoMeetingData.participants.join(', ')}
                onChange={handleVideoMeetingDataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleGenerateVideoMeetingMinutes}
              disabled={isLoading || !videoMeetingData.recordingUrl}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Video Meeting Minutes'
              )}
            </button>
          </div>
        </div>

        {error && <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        {summary && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">{summary.title || 'Generated Summary'}</h2>

            {summary.summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-gray-700">{summary.summary}</p>
              </div>
            )}

            {summary.keyPoints && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {summary.keyPoints.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.actionItems && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Action Items</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {summary.actionItems.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.keyTopics && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Key Topics</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {summary.keyTopics.map((topic: string, index: number) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.sentiment && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Sentiment</h3>
                <span
                  className={`px-3 py-1 rounded ${
                    summary.sentiment === 'positive'
                      ? 'bg-green-100 text-green-800'
                      : summary.sentiment === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
