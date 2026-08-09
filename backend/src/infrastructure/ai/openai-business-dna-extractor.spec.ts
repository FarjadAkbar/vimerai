import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  BUSINESS_DNA_OUTPUT_SCHEMA,
  BUSINESS_DNA_SYSTEM_PROMPT,
  mapExtraction,
  OpenAiBusinessDnaExtractor,
} from '@/infrastructure/ai/openai-business-dna-extractor';
import { parseHomepageHtml } from '@/infrastructure/scrape/html-homepage-scrape.provider';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createConfigService(): ConfigService {
  return {
    get: (key: string) => {
      if (key === 'openai.apiKey') return 'test-key';
      if (key === 'openai.baseUrl') return 'https://api.openai.com/v1';
      if (key === 'openai.model') return 'gpt-4o-mini';
      return undefined;
    },
  } as ConfigService;
}

function loadNitroshineScrape() {
  const html = readFileSync(
    join(
      __dirname,
      '../../testing/fixtures/scrape/nitroshine-homepage.html',
    ),
    'utf8',
  );
  return parseHomepageHtml('https://nitroshinepro.com/', html);
}

describe('OpenAiBusinessDnaExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires imageStyle and writingStyle as grounded prose in the prompt schema', () => {
    expect(BUSINESS_DNA_SYSTEM_PROMPT).toMatch(/imageStyle/i);
    expect(BUSINESS_DNA_SYSTEM_PROMPT).toMatch(/writingStyle/i);
    expect(BUSINESS_DNA_SYSTEM_PROMPT).toMatch(/REQUIRED/i);
    expect(BUSINESS_DNA_SYSTEM_PROMPT).toMatch(/photography|visual direction/i);
    expect(BUSINESS_DNA_SYSTEM_PROMPT).toMatch(/copy voice|sentence shape/i);

    expect(BUSINESS_DNA_OUTPUT_SCHEMA.imageStyle).toMatch(/required/i);
    expect(BUSINESS_DNA_OUTPUT_SCHEMA.writingStyle).toMatch(/required/i);
    expect(BUSINESS_DNA_OUTPUT_SCHEMA.imageStyle).not.toMatch(/\|null/);
    expect(BUSINESS_DNA_OUTPUT_SCHEMA.writingStyle).not.toMatch(/\|null/);
  });

  it('maps rich imageStyle and writingStyle from structured LLM JSON', () => {
    const scrape = loadNitroshineScrape();
    const imageStyle =
      'Images should feature high-contrast, sharp photography with a focus on before and after results. Use a modern studio aesthetic with clean white pedestals for product shots, complemented by dynamic red lighting streaks to imply speed and performance.';
    const writingStyle =
      'The writing style should be authoritative yet accessible, focusing on the pro-grade results at home promise. Use instructional and encouraging language that simplifies the detailing process.';

    const result = mapExtraction(scrape, {
      name: 'NitroShine',
      primaryColor: '#E80000',
      tone: 'professional',
      audience: 'Car enthusiasts in Karachi',
      imageStyle,
      writingStyle,
      tagline: 'Showroom Shine Starts With Nitro Shine',
    });

    expect(result.businessDna.imageStyle).toBe(imageStyle);
    expect(result.businessDna.writingStyle).toBe(writingStyle);
    expect(result.businessDna.imageStyle!.split(/[.!?]/).filter(Boolean).length).toBeGreaterThanOrEqual(2);
    expect(result.businessDna.writingStyle!.split(/[.!?]/).filter(Boolean).length).toBeGreaterThanOrEqual(2);
  });

  it('fills non-empty grounded fallbacks when the LLM omits style fields', () => {
    const scrape = loadNitroshineScrape();

    const result = mapExtraction(scrape, {
      name: 'NitroShine',
      primaryColor: '#E80000',
      tone: 'professional',
      audience: 'Car enthusiasts',
      imageStyle: null,
      writingStyle: '   ',
    });

    expect(result.businessDna.imageStyle).toBeTruthy();
    expect(result.businessDna.writingStyle).toBeTruthy();
    expect(result.businessDna.imageStyle!.length).toBeGreaterThan(40);
    expect(result.businessDna.writingStyle!.length).toBeGreaterThan(40);
    expect(result.businessDna.imageStyle).toMatch(/NitroShine|car care|photography/i);
    expect(result.businessDna.writingStyle).toMatch(/Showroom Shine|homepage|voice/i);
  });

  it('asks OpenAI with the required schema and returns structured DNA styles', async () => {
    const scrape = loadNitroshineScrape();
    const extractor = new OpenAiBusinessDnaExtractor(createConfigService());

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'NitroShine',
                primaryColor: '#E80000',
                secondaryColor: '#1A1A1A',
                tone: 'professional',
                audience: 'Car enthusiasts in Karachi',
                typography: 'Montserrat',
                colorPalette: ['#FFFFFF'],
                tagline: 'Showroom Shine Starts With Nitro Shine',
                values: ['Professional Quality', 'Reliability'],
                aesthetic: ['Modern', 'Clean'],
                toneOfVoice: 'Authoritative yet accessible',
                imageStyle:
                  'Images should feature high-contrast, sharp photography with a focus on before and after results. Use a modern studio aesthetic with clean white pedestals for product shots on high-end vehicles with visible water beading.',
                writingStyle:
                  'The writing style should be authoritative yet accessible, focusing on the pro-grade results at home promise. Use instructional and encouraging language that simplifies detailing and emphasizes ease of use.',
                industry: 'Automotive & Transportation Services',
                primaryLanguage: 'English',
                elevatorPitch: 'Pro-grade car care for home use.',
              }),
            },
          },
        ],
      },
    });

    const result = await extractor.extract(scrape);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body.messages[0].content).toBe(BUSINESS_DNA_SYSTEM_PROMPT);
    const userPayload = JSON.parse(body.messages[1].content as string) as {
      schema: typeof BUSINESS_DNA_OUTPUT_SCHEMA;
      textContent: string;
    };
    expect(userPayload.schema.imageStyle).toMatch(/required/i);
    expect(userPayload.schema.writingStyle).toMatch(/required/i);
    expect(userPayload.textContent).toContain('Karachi');

    expect(result.businessDna.imageStyle).toMatch(/high-contrast|photography/i);
    expect(result.businessDna.writingStyle).toMatch(/authoritative|instructional/i);
    expect(result.businessDna.imageStyle!.length).toBeGreaterThan(80);
    expect(result.businessDna.writingStyle!.length).toBeGreaterThan(80);
    expect(result.name).toBe('NitroShine');
    expect(result.businessDna.tagline).toContain('Showroom Shine');
  });
});
