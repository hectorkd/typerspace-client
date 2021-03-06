import IGameData from './IGameData';

export default interface IPlayer {
  userId: string;
  userName: string;
  color: string;
  isHost: boolean;
  gameData: IGameData;
  userParagraph: string;
  appliedPUs: { id: string; powerUp: string }[];
  availablePUs: { id: string; powerUp: string }[];
  isReady: boolean;
  rank: number;
  WPMAverage: number;
}
