import { useCallback, useState } from 'react';
import { uploadPDF, askQuestion } from './api/api';
import Header from './components/Header';
import PdfUploader from './components/PdfUploader';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  const handleUpload = useCallback(async (file) => {
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const data = await uploadPDF(file);
      setUploadedFilename(data.filename || file.name);
      setUploadSuccess(true);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to upload PDF. Please try again.';
      setUploadSuccess(false);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Upload error: ${message}` },
      ]);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSend = useCallback(async (question) => {
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsAsking(true);

    try {
      const data = await askQuestion(question);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ]);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${message}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  }, []);

  return (
    <div className="app">
      <div className="app__background" aria-hidden="true" />
      <div className="app__container">

  <Header />

  <div className="layout">

    <aside className="sidebar">
      <PdfUploader
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadedFilename={uploadedFilename}
        uploadSuccess={uploadSuccess}
      />
    </aside>

    <main className="chat-section">
      <ChatWindow
        messages={messages}
        isTyping={isAsking}
      />

      <ChatInput
        onSend={handleSend}
        isLoading={isAsking}
        disabled={!uploadSuccess}
      />
    </main>

  </div>

</div>
    </div>
  );
}

export default App;
