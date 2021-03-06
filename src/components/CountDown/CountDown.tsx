import React, { useEffect } from 'react';

import './CountDown.scss';

type CountDownProps = {
  countdown: number;
  setCountDown: any;
};

const CountDown: React.FC<CountDownProps> = (props) => {
  useEffect(() => {
    if (!props.countdown) return;

    const timer = setInterval(() => {
      props.setCountDown(props.countdown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [props.countdown]);

  return (
    <div>
      {props.countdown > 0 && (
        <h1 className="countdown-numbers">{props.countdown}</h1>
      )}
    </div>
  );
};

export default CountDown;
