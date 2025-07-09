import { CommandArguments } from "./commands.enum";

export const getRandomCypressUsername = () => {
  return `${CommandArguments.cypressUsername}${Date.now()}`;
};
