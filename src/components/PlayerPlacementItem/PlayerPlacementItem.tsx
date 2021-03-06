import React from 'react';
import IGameData from '../../interfaces/IGameData';
import './styles/PlayerPlacementItem.scss';

type PlayerPlacementItemProps = {
  rocketColor: string;
  name: string;
  gameData: IGameData;
  rank: number;
  WPMAverage: number | undefined;
  final: boolean;
};

const PlayerListItem: React.FC<PlayerPlacementItemProps> = ({
  rocketColor,
  name,
  gameData,
  rank,
  WPMAverage,
  final,
}) => {
  function placeEnd(rank: number): string {
    let end;
    if (rank === 2) {
      end = 'nd';
    } else if (rank === 3) {
      end = 'rd';
    } else {
      end = 'th';
    }
    return '' + rank + end;
  }
  return (
    <div className="placement-container">
      {gameData.WPM ? (
        <div className="conditional-render">
          <div className="placement-name-container">
            <div className="placement-place">
              <h3 className="finishing-place">{placeEnd(rank)}</h3>
            </div>
            <div className="placement-name">
              <h3 className="racer-name" style={{ color: rocketColor }}>
                {name}
              </h3>
            </div>
          </div>
          <div className="placement-wpm-container">
            <h3 className="placement-wpm">
              {final ? WPMAverage : gameData.WPM}
            </h3>
          </div>
          {final ? null : (
            <div className="placement-accuracy-container">
              <h3 className="placement-accuracy">{gameData.accuracy}%</h3>
            </div>
          )}
          {final ? null : (
            <div className="placement-time-container">
              <h3 className="placement-time">
                {final ? null : gameData.finishTime}
              </h3>
            </div>
          )}
        </div>
      ) : (
        <h2>
          <span style={{ color: rocketColor }}>{name}</span> is still in the
          drivers seat!
        </h2>
      )}
    </div>
  );
};

export default PlayerListItem;
