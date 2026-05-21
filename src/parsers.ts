import { warning } from '@actions/core';
import type { IContainer, IOpenUrlAction } from '@microsoft/teams.cards';
import { parse as parseYaml } from 'yaml';
import { isValidContainerStyle, isValidOpenUrlAction } from './definitions.js';

/**
 * Parses a string into a valid ContainerStyle if possible, otherwise returns undefined.
 */
export const parseStyle = (raw: string): IContainer['style'] => {
  return raw.length > 0 && isValidContainerStyle(raw) ? raw : undefined;
};

/**
 * Parses a YAML string into an array of IOpenUrlAction objects.
 * Invalid items are skipped with a warning.
 */
export const parseActions = (raw: string): IOpenUrlAction[] => {
  const parsed = parseYaml(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.reduce((acc, item) => {
    if (isValidOpenUrlAction(item)) {
      acc.push({ type: 'Action.OpenUrl' as const, title: item.title, url: item.url });
    } else {
      warning(
        `Skipping action: unsupported or invalid item (type must be "Action.OpenUrl" with string title and url). Got: ${JSON.stringify(item)}`,
      );
    }
    return acc;
  }, [] as IOpenUrlAction[]);
};

/**
 * Parses a YAML string into an array of IContainer objects.
 * Invalid items are skipped with a warning.
 */
export const parseSections = (raw: string): IContainer[] => {
  const parsed = parseYaml(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.reduce((acc, item) => {
    if (typeof item === 'object' && item !== null && item.type === 'Container' && Array.isArray(item.items)) {
      acc.push(item);
    } else {
      warning(
        `Skipping section: invalid item (must be a Container object with an items array). Got: ${JSON.stringify(item)}`,
      );
    }
    return acc;
  }, [] as IContainer[]);
};
