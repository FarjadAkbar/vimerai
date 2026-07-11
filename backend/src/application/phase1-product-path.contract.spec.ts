import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 1 product path contract (ticket 12)', () => {
  const backendSrc = path.join(__dirname, '..');
  const appModulePath = path.join(backendSrc, 'app.module.ts');
  const envExamplePath = path.join(backendSrc, '..', '.env.example');
  const frontendHeaderPath = path.join(
    backendSrc,
    '..',
    '..',
    'frontend',
    'src',
    'components',
    'header.tsx',
  );

  it('does not wire Product Kit, Prompt Studio, or legacy Generator into AppModule', () => {
    const source = fs.readFileSync(appModulePath, 'utf8');

    expect(source).not.toMatch(/\bKitsModule\b/);
    expect(source).not.toMatch(/\bPromptsModule\b/);
    expect(source).not.toMatch(/\bGeneratorModule\b/);
    expect(source).not.toMatch(/\bkitConfig\b/);
    expect(source).not.toMatch(/ACTIVE_KIT/);
  });

  it('Generation module has no Product Kit or Prompt Studio dependency', () => {
    const generationModulePath = path.join(
      backendSrc,
      'application',
      'generation',
      'generation.module.ts',
    );
    const generationServicePath = path.join(
      backendSrc,
      'application',
      'generation',
      'generation.service.ts',
    );
    const moduleSource = fs.readFileSync(generationModulePath, 'utf8');
    const serviceSource = fs.readFileSync(generationServicePath, 'utf8');

    expect(moduleSource).not.toMatch(/KitsModule|ProductKit|ACTIVE_KIT|PromptsModule/);
    expect(serviceSource).not.toMatch(
      /ProductKit|IProductKitService|ACTIVE_KIT|PromptTemplate/,
    );
  });

  it('does not require ACTIVE_KIT / KIT_ROOT in env example', () => {
    const source = fs.readFileSync(envExamplePath, 'utf8');

    expect(source).not.toMatch(/ACTIVE_KIT_ID/);
    expect(source).not.toMatch(/KIT_ROOT_DIR/);
  });

  it('does not expose Prompt Studio in consumer nav', () => {
    const source = fs.readFileSync(frontendHeaderPath, 'utf8');

    expect(source).not.toMatch(/prompt-studio/);
    expect(source).not.toMatch(/Prompt Studio/);
  });

  it('home Generate path uses BrandGeneration, not legacy Generator', () => {
    const homePath = path.join(
      backendSrc,
      '..',
      '..',
      'frontend',
      'src',
      'app',
      'page.tsx',
    );
    const source = fs.readFileSync(homePath, 'utf8');

    expect(source).toMatch(/BrandGeneration/);
    expect(source).not.toMatch(/\bGenerator\b/);
    expect(source).not.toMatch(/useActiveKit/);
  });
});
