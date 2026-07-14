const generateContent = jest.fn();
const getGenerativeModel = jest.fn(() => ({ generateContent }));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({ getGenerativeModel })),
}));

import { GeminiSpeechToTextProvider } from './gemini-stt.provider';

describe('GeminiSpeechToTextProvider', () => {
  const config = (apiKey?: string) => ({ get: jest.fn((key: string) => (key === 'GEMINI_API_KEY' ? apiKey : undefined)) });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not create a model without an API key', () => {
    new GeminiSpeechToTextProvider(config() as any);

    expect(getGenerativeModel).not.toHaveBeenCalled();
  });

  it('transcribes audio buffers through Gemini multimodal input', async () => {
    const provider = new GeminiSpeechToTextProvider(config('key') as any);
    generateContent.mockResolvedValueOnce({ response: { text: () => ' hola desde audio ' } });

    await expect(provider.transcribe(Buffer.from('audio'))).resolves.toBe('hola desde audio');
    expect(generateContent).toHaveBeenCalledWith([
      { inlineData: { mimeType: 'audio/webm', data: Buffer.from('audio').toString('base64') } },
      { text: expect.stringContaining('Transcribe el audio') },
    ]);
  });

  it('returns user-safe messages for empty or failed transcriptions', async () => {
    const provider = new GeminiSpeechToTextProvider(config('key') as any);
    const errorSpy = jest.spyOn((provider as any).logger, 'error').mockImplementation();
    generateContent
      .mockResolvedValueOnce({ response: { text: () => '   ' } })
      .mockRejectedValueOnce(new Error('quota'));

    await expect(provider.transcribe(Buffer.from('audio'))).resolves.toBe('No se pudo transcribir el audio.');
    await expect(provider.transcribe(Buffer.from('audio'))).resolves.toBe('Error al transcribir el audio. Por favor intenta de nuevo.');

    errorSpy.mockRestore();
  });
});
