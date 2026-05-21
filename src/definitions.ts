import type { ContainerStyle, IAdaptiveCard, IContainer, IOpenUrlAction } from '@microsoft/teams.cards';

/**
 * Interface representing the payload for a Teams webhook message.
 */
export interface TeamsWebhookPayload {
  type: 'message';
  attachments: [
    {
      contentType: 'application/vnd.microsoft.card.adaptive';
      content: IAdaptiveCard;
    },
  ];
}

/**
 * List of valid Container styles as defined by the Adaptive Cards schema.
 */
export const CONTAINER_STYLES: readonly ContainerStyle[] = [
  'default',
  'emphasis',
  'accent',
  'good',
  'attention',
  'warning',
];

/**
 * Type guard to check if a value is a valid ContainerStyle.
 */
export const isValidContainerStyle = (value: string): value is ContainerStyle => {
  return (CONTAINER_STYLES as readonly string[]).includes(value);
};

/**
 * Type guard to check if a value is a valid Action.OpenUrl action.
 */
export const isValidOpenUrlAction = (value: unknown): value is IOpenUrlAction => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as IOpenUrlAction).type === 'Action.OpenUrl' &&
    typeof (value as IOpenUrlAction).title === 'string' &&
    typeof (value as IOpenUrlAction).url === 'string'
  );
};

/**
 * Type guard to check if a value is a valid Container element.
 */
export const isValidContainer = (value: unknown): value is IContainer => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as IContainer).type === 'Container' &&
    Array.isArray((value as IContainer).items)
  );
};
