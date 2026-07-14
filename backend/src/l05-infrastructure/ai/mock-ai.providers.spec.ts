import { MockLanguageModelProvider, MockSpeechToTextProvider, MockTextToSpeechProvider } from './mock-ai.providers';

describe('mock-ai.providers', () => {
  it('exports all mock AI providers used in local tests and fallback wiring', async () => {
    const language = new MockLanguageModelProvider();

    await expect(language.generateResponse('hola')).resolves.toContain('hola');
    await expect(language.extractEntities('zapatos')).resolves.toMatchObject({ intent: 'buscar_producto' });
    await expect(language.generateCopilotResponse('hola', [], [])).resolves.toMatchObject({ action: { type: 'none' } });
    await expect(new MockSpeechToTextProvider().transcribe(Buffer.from('audio'))).resolves.toContain('transcrito');
    await expect(new MockTextToSpeechProvider().synthesize('hola')).resolves.toEqual(Buffer.from('mock-audio-data'));
  });
});
