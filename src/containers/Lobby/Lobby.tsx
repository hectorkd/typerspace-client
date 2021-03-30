import React, { ReactNode, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import IPlayer from '../../interfaces/IPlayer';
import PlayersList from '../../components/PlayerList/PlayerList';

import './styles/Lobby.scss';
import powerCardsObj from '../../assets/icons/powerCardsObj';

type LobbyProps = {
  socket: any;
  setSocket: React.Dispatch<React.SetStateAction<undefined>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  children?: ReactNode;
  players: IPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
};

const Lobby: React.FC<LobbyProps> = (props) => {
  const { roomId } = useParams<Record<string, string | undefined>>();
  const history = useHistory();
  const [isHost, setIsHost] = useState(false);
  const [rounds, setRounds] = useState<number>(0);
  const [currRound, setCurrRound] = useState<number>(0);
  const [currPlayer, setCurrPlayer] = useState<IPlayer>();
  const [gamemode, setGamemode] = useState<string>('');
  const [playerAvailablePowerUps, setPlayerAvailablePowerUps] = useState<
    { id: string; powerUp: string }[]
  >([]);

  useEffect(() => {
    props.socket.current.on(
      'getGameState',
      (rounds: number, currRound: number, gamemode: string) => {
        setRounds(rounds);
        setCurrRound(currRound);
        setGamemode(gamemode);
      },
    );

    //get players
    props.socket.current.on('playerInfo', (players: IPlayer[]) => {
      console.log('THIS IS THE ONE!', players);
      props.setPlayers(players);
      const player = players.filter(
        (player) => player.userId === props.socket.current.id,
      );
      // console.log('Is host?', player[0].isHost);
      setCurrPlayer(player[0]);

      setIsHost(player[0].isHost);
      props.setText(player[0].userParagraph);
    });
  }, []); //don't add props to array

  useEffect(() => {
    if (currPlayer) setPlayerAvailablePowerUps(currPlayer?.availablePUs);
  }, [currPlayer]);

  //synchronise timestart for all players
  function handleClickStart(): void {
    props.socket.current.emit('syncStart');
    history.push({
      pathname: `/${roomId}/race`,
    });
  }

  // go to race when host clicked Start Sace
  props.socket.current.on('startRace', () => {
    history.push({
      pathname: `/${roomId}/race`,
    });
  });

  function onApplyPowerUp(result: any) {
    console.log(result);
    if (!result.destination) return;
    if (result.destination.droppableId === 'my-powerups') return;
    if (result.destination.droppableId === currPlayer?.userName) return;
    console.log('you are here');
    opacity = '0%';
    props.socket.current.emit('applyPower', {
      power: result.draggableId,
      userName: result.destination.droppableId,
    });
  }

  const cardWidth = '150px';
  let opacity = '100%';

  function getStyle(style: any, snapshot: any) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    const { moveTo, curve, duration } = snapshot.dropAnimation;
    const translate = `translate(${moveTo.x + 30}px, ${moveTo.y - 50}px)`;
    const scale = 'scale(.4)';

    return {
      ...style,
      transform: `${translate} ${scale}`,
      transition: `all ${curve} ${duration + 2}s`,
    };
  }

  return (
    <div className="lobby-bg-container">
      <DragDropContext onDragEnd={onApplyPowerUp}>
        <div className="lobby-room-display-box"></div>
        {rounds ? (
          <h1>
            Round {currRound} of {rounds}
          </h1>
        ) : null}
        <PlayersList players={props.players} socket={props.socket} />
        <button
          disabled={!isHost}
          onClick={handleClickStart}
          className={isHost ? 'lobby-btn-start' : 'lobby-btn-start-disabled'}
        >
          {' '}
          Start Race{' '}
        </button>
        {gamemode ? (
          <Droppable droppableId="my-powerups">
            {(provided: any) => (
              <div
                className="my-power-ups"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {playerAvailablePowerUps.map(({ id, powerUp }, index) => {
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided: any, snapshot) => (
                        <div
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          style={getStyle(
                            provided.draggableProps.style,
                            snapshot,
                          )}
                        >
                          <img
                            style={{ width: cardWidth, opacity: opacity }}
                            src={powerCardsObj[powerUp]}
                          ></img>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : null}
      </DragDropContext>
    </div>
  );
};

export default Lobby;
