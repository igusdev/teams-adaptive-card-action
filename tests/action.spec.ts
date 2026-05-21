import { describe, expect, it, jest } from '@jest/globals';

jest.unstable_mockModule('@actions/core', () => ({
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  getInput: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
}));

const { getInput, warning } = await import('@actions/core');
const { action } = await import('../src/action.js');

function mockInputs(inputs: Record<string, string>) {
  (getInput as jest.Mock<typeof getInput>).mockClear().mockImplementation((input: string) => inputs[input] ?? '');
  (warning as jest.Mock<typeof warning>).mockClear();
}

function mockFetch(status = 200, body = '') {
  return jest.spyOn(global, 'fetch').mockResolvedValue(new Response(body, { status }));
}

function getCard(fetchMock: jest.SpiedFunction<typeof global.fetch>) {
  const body = (fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string;
  return JSON.parse(body).attachments[0].content;
}

describe('Action', () => {
  it('should send adaptive card with title, message, and valid style', async () => {
    const fetchMock = mockFetch();
    mockInputs({ webhook: 'https://my-webhook.com/', title: 'Hiho!', message: 'Hello World!', style: 'good' });

    await expect(action()).resolves.not.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://my-webhook.com/');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');

    const payload = JSON.parse(init.body as string);
    expect(payload.type).toBe('message');
    const card = payload.attachments[0].content;
    expect(card.type).toBe('AdaptiveCard');
    expect(card.version).toBe('1.4');

    const mainContainer = card.body[0];
    expect(mainContainer.style).toBe('good');
    expect(mainContainer.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'TextBlock', text: 'Hiho!', weight: 'Bolder' }),
        expect.objectContaining({ type: 'TextBlock', text: 'Hello World!', wrap: true }),
      ]),
    );
    expect(card.actions).toEqual([]);

    fetchMock.mockRestore();
  });

  it('should fall back to undefined style for unrecognized value', async () => {
    const fetchMock = mockFetch();
    mockInputs({ webhook: 'https://my-webhook.com/', message: 'Hello', style: 'red' });

    await action();

    const card = getCard(fetchMock);
    expect(card.body[0].style).toBeUndefined();

    fetchMock.mockRestore();
  });

  it('should parse YAML actions into card actions, skipping invalid items with a warning', async () => {
    const fetchMock = mockFetch();
    mockInputs({
      webhook: 'https://my-webhook.com/',
      message: 'Hello World!',
      actions: [
        '- type: Action.OpenUrl',
        '  title: Click here!',
        '  url: https://foo.com/',
        '- type: Action.OpenUrl',
        '  title: Or here',
        '  url: https://bar.com/',
        '- type: Action.Unknown',
        '  title: Bad',
        '  url: https://bad.com/',
      ].join('\n'),
    });

    await action();

    const card = getCard(fetchMock);
    expect(card.actions).toEqual([
      { type: 'Action.OpenUrl', title: 'Click here!', url: 'https://foo.com/' },
      { type: 'Action.OpenUrl', title: 'Or here', url: 'https://bar.com/' },
    ]);
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Skipping action'));

    fetchMock.mockRestore();
  });

  it('should render valid Container sections in card body', async () => {
    const fetchMock = mockFetch();
    mockInputs({
      webhook: 'https://my-webhook.com/',
      message: 'Hello World!',
      sections: [
        '- type: Container',
        '  items:',
        '    - type: TextBlock',
        '      text: Hello from section',
        '    - type: FactSet',
        '      facts:',
        '        - title: foo',
        '          value: bar',
      ].join('\n'),
    });

    await action();

    const card = getCard(fetchMock);
    expect(card.body).toHaveLength(2);
    const section = card.body[1];
    expect(section.type).toBe('Container');
    expect(section.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'TextBlock', text: 'Hello from section' }),
        expect.objectContaining({ type: 'FactSet', facts: [{ title: 'foo', value: 'bar' }] }),
      ]),
    );

    fetchMock.mockRestore();
  });

  it('should warn and skip invalid section items', async () => {
    const fetchMock = mockFetch();
    mockInputs({
      webhook: 'https://my-webhook.com/',
      message: 'Hello World!',
      sections: ['- type: TextBlock', '  text: Not a container', '- facts:', '  - title: foo', '    value: bar'].join(
        '\n',
      ),
    });

    await action();

    const card = getCard(fetchMock);
    expect(card.body).toHaveLength(1); // only main container
    expect(warning).toHaveBeenCalledTimes(2);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Skipping section'));

    fetchMock.mockRestore();
  });

  it('should throw with response body on non-ok response', async () => {
    const fetchMock = mockFetch(400, 'Bad Request');
    mockInputs({ webhook: 'https://my-webhook.com/', message: 'Hello' });

    await expect(action()).rejects.toThrow('Teams webhook failed [400]: Bad Request');

    fetchMock.mockRestore();
  });
});
