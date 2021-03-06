import React, { ReactNode, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

import IPlayer from '../../interfaces/IPlayer';
import PlayersList from '../../components/PlayerList/PlayerList';

import './styles/Lobby.scss';
import powerCardsObj from '../../assets/icons/powerCardsObj';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

type LobbyProps = {
  socket: any;
  setSocket: React.Dispatch<React.SetStateAction<undefined>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  children?: ReactNode;
  players: IPlayer[];
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
  rounds: number;
  currRound: number;
};

const Lobby: React.FC<LobbyProps> = (props) => {
  const { roomId } = useParams<Record<string, string | undefined>>();
  const history = useHistory();
  const [isHost, setIsHost] = useState(false);
  const [currPlayer, setCurrPlayer] = useState<IPlayer>();
  const [gamemode, setGamemode] = useState<string>('');
  const [playerAvailablePowerUps, setPlayerAvailablePowerUps] = useState<
    { id: string; powerUp: string }[]
  >([]);
  const [startBtnAnimationClass, setStartBtnAnimationClass] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [randomUuid, setRandomUuid] = useState<string>();

  useEffect(() => {
    //get players
    props.socket.current.on('playerInfo', (players: IPlayer[]) => {
      props.setPlayers(players);
    });
    setRandomUuid(uuidv4());
  }, []); //don't add props to array

  useEffect(() => {
    if (props.players.every((player) => player.isReady)) setIsReady(true);
    const player = props.players.filter(
      (player) => player.userId === props.socket.current.id,
    );
    setCurrPlayer(player[0]);
    setPlayerAvailablePowerUps(player[0].availablePUs);
    setIsHost(player[0].isHost);
    props.setText(player[0].userParagraph);
  }, [props.players]);

  //synchronise timestart for all players
  function handleClickStart(): void {
    setStartBtnAnimationClass('btn-press');
    setTimeout(() => {
      props.socket.current.emit('syncStart');
      history.push({
        pathname: `/${roomId}/race`,
      });
    }, 400);
  }

  // go to race when host clicked Start Sace
  props.socket.current.on('startRace', () => {
    history.push({
      pathname: `/${roomId}/race`,
    });
  });

  function onApplyPowerUp(result: any) {
    if (!result.destination) return;
    if (result.destination.droppableId === 'my-powerups') return;
    if (result.destination.droppableId === currPlayer?.userName) return;
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
    if (
      snapshot.draggingOver === null ||
      snapshot.draggingOver === 'my-powerups' ||
      snapshot.draggingOver === currPlayer?.userName
    ) {
      return style;
    }
    const { moveTo, curve, duration } = snapshot.dropAnimation;
    const translate = `translate(${moveTo.x + 30}px, ${moveTo.y - 50}px)`;
    const scale = 'scale(.4)';
    const rotate = 'rotate(3turn)';

    return {
      ...style,
      transform: `${translate} ${scale} ${rotate}`,
      transition: `all ${curve} ${duration + 1}s`,
    };
  }

  return (
    <TransitionGroup>
      <CSSTransition
        key={randomUuid}
        classNames={{ exit: 'slide-leave', exitActive: 'slide-leave-active' }}
        timeout={1000}
        appear
        on
      >
        <>
          <div className="lobby-container">
            <DragDropContext onDragEnd={onApplyPowerUp}>
              <div className="lobby-room-display-box">
                <div className="fixed-elements-display">
                  {props.rounds ? (
                    <h1 className="round-count">
                      Round {props.currRound} of {props.rounds}
                    </h1>
                  ) : null}
                  <PlayersList players={props.players} socket={props.socket} />
                </div>
                <div className="card-and-button-container">
                  {!gamemode ? (
                    <Droppable droppableId="my-powerups">
                      {(provided: any) => (
                        <div
                          className="my-power-ups"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {playerAvailablePowerUps.map(
                            ({ id, powerUp }, index) => {
                              return (
                                <Draggable
                                  key={id}
                                  draggableId={id}
                                  index={index}
                                >
                                  {(provided: any, snapshot: any) => (
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
                                        style={{
                                          width: cardWidth,
                                          opacity: opacity,
                                        }}
                                        src={powerCardsObj[powerUp]}
                                      ></img>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            },
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ) : null}
                  <button
                    disabled={!isHost || !isReady}
                    onClick={handleClickStart}
                    className={
                      isHost && isReady
                        ? `lobby-btn-start ${startBtnAnimationClass}`
                        : 'lobby-btn-start-disabled'
                    }
                  >
                    {' '}
                    Start Race{' '}
                  </button>
                </div>
              </div>
            </DragDropContext>
          </div>
        </>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default Lobby;
