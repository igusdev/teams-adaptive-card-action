import { endGroup, getInput, info, InputOptions, startGroup } from '@actions/core';
import type { IContainer, ITextBlock } from '@microsoft/teams.cards';
import { TeamsWebhookPayload } from './definitions.js';
import { parseActions, parseSections, parseStyle } from './parsers.js';

const inputOptions: InputOptions = { trimWhitespace: true };

export async function action() {
  const webhookURL = getInput('webhook', { ...inputOptions, required: true });
  const title = getInput('title', inputOptions);
  const message = getInput('message', inputOptions);
  const style = parseStyle(getInput('style', inputOptions));
  const actions = parseActions(getInput('actions', inputOptions));
  const sections = parseSections(getInput('sections', inputOptions));

  const mainItems: IContainer['items'] = [];
  if (title.length > 0) {
    mainItems.push({ type: 'TextBlock', text: title, size: 'Large', weight: 'Bolder' } satisfies ITextBlock);
  }
  if (message.length > 0) {
    mainItems.push({ type: 'TextBlock', text: message, wrap: true } satisfies ITextBlock);
  }

  const payload: TeamsWebhookPayload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [{ type: 'Container', style, items: mainItems }, ...sections],
          actions,
        },
      },
    ],
  };

  startGroup('Payload to send');
  info(JSON.stringify(payload, undefined, 2));
  endGroup();

  const response = await fetch(webhookURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Teams webhook failed [${response.status}]: ${responseBody}`);
  }

  info('\n✅ Success!');
}
