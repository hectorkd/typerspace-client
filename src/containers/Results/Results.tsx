import React, { ReactNode, useEffect, useState } from 'react';
import IPlayer from '../../interfaces/IPlayer';
import rocket2 from '../../assets/icons/rocket2yellow.png';
import PlayerPlacementItem from '../../components/PlayerPlacementItem/PlayerPlacementItem';
import './styles/Results.scss';

import blueRocket from '../../assets/icons/rocket1blue.png';
import yellowRocket from '../../assets/icons/rocket2yellow.png';
import orangeRocket from '../../assets/icons/rocket3orange.png';
import pinkRocket from '../../assets/icons/rocket4pink.png';
import violetRocket from '../../assets/icons/rocket5violet.png';
import { useParams } from 'react-router-dom';

type Props = {
  socket: any;
  setSocket: any;
  text: string;
  setText: any;
  children?: ReactNode;
  players: IPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
};

const Results: React.FC<Props> = (props) => {
  const { roomId } = useParams<Record<string, string | undefined>>();
  const rocketObj: any = {
    blueRocket,
    yellowRocket,
    orangeRocket,
    pinkRocket,
    violetRocket,
  };

  const testPlayers = [0, 1, 2, 3];
  const [resultsPlayers, setResultsPlayers] = useState<IPlayer[]>([]);

  // useEffect(() => {
  //get results
  props.socket.current.on('results', (players: IPlayer[]) => {
    console.log('received from server for room ', players);
    players.sort((a, b) => b.gameData.WPM - a.gameData.WPM);
    setResultsPlayers(players);
  });
  // }, [resultsPlayers]);

  return (
    <div className="results-bg-container">
      <div className="room-id-display-box">
        <h1 className="room-id-text">Race #{roomId}</h1>
      </div>
      <div className="results-display-box">
        {resultsPlayers.length > 0 ? (
          <div>
            <div className="winner-info-container">
              <div className="winner-info">
                <div className="wpm-display">
                  <h1 className="wpm-title">WPM:</h1>
                  <div className="wpm-container">
                    <h1 className="wpm-value">
                      {resultsPlayers[0].gameData.WPM}
                    </h1>
                  </div>
                </div>
                <div className="time-display">
                  <h1 className="time-title">Time:</h1>
                  <div className="time-container">
                    <h1 className="time-value">
                      {resultsPlayers[0].gameData.finishTime}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="winner-visual">
                <div className="winner-text">
                  <h3 className="winner:">Winner:</h3>
                  <h3
                    className="winner-name"
                    style={{ color: resultsPlayers[0].color }}
                  >
                    {resultsPlayers[0].userName}
                  </h3>
                </div>
                <div className="rocket-icon">
                  <img
                    src={rocketObj[`${resultsPlayers[0].color}Rocket`]}
                    className="winner-icon"
                  />
                </div>
              </div>
            </div>
            <div className="table-header">
              <h3>Place</h3>
              <h3>Player</h3>
              <h3>WPM</h3>
              <h3>Accuracy</h3>
              <h3>Time</h3>
            </div>
            <div className="placement-info-container">
              {resultsPlayers.slice(1).map((element) => {
                return (
                  <PlayerPlacementItem
                    key={element.userName}
                    name={element.userName}
                    rocketColor={element.color}
                    gameData={element.gameData}
                    rank={resultsPlayers.indexOf(element) + 1}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <h1>No Data Yet</h1>
        )}
      </div>
    </div>
  );
};

export default Results;