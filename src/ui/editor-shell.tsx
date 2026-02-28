import React, { useState } from 'react';

export function EditorShell() {
  const [contentType, setContentType] = useState('Article');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [draftText, setDraftText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveSuccessMessage('');
    setSaveErrorMessage('');

    try {
      const response = await fetch('/api/internal/content/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: topicPrompt || `${contentType} Draft`,
          body: draftText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft.');
      }

      setSaveSuccessMessage('Draft saved successfully.');
    } catch (error) {
      console.error('Save draft failed', error);
      setSaveErrorMessage('Unable to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <h1>Railfin Editor</h1>

      <label htmlFor="content-type">Content Type</label>
      <select
        id="content-type"
        name="contentType"
        value={contentType}
        onChange={(event) => setContentType(event.target.value)}
      >
        <option value="Article">Article</option>
        <option value="Newsletter">Newsletter</option>
        <option value="Email">Email</option>
        <option value="Social Media Post">Social Media Post</option>
      </select>

      <label htmlFor="topic-prompt">Topic / Prompt</label>
      <input
        id="topic-prompt"
        name="topicPrompt"
        type="text"
        placeholder="e.g. Product update for Q2 launch"
        value={topicPrompt}
        onChange={(event) => setTopicPrompt(event.target.value)}
      />

      <label htmlFor="draft-text">Draft</label>
      <textarea
        id="draft-text"
        name="draftText"
        rows={10}
        placeholder="Start your draft here..."
        value={draftText}
        onChange={(event) => setDraftText(event.target.value)}
      />

      <button type="button" onClick={handleSaveDraft} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Draft'}
      </button>

      {saveSuccessMessage ? <p>{saveSuccessMessage}</p> : null}
      {saveErrorMessage ? <p>{saveErrorMessage}</p> : null}

      <button type="button">Run Compliance Check</button>
    </section>
  );
}
