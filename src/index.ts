import { action } from './action.js';
import { setFailed } from '@actions/core';

try {
  await action();
} catch (error) {
  setFailed(error as Error);
}
