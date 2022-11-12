import ProgressBar from 'react-bootstrap/ProgressBar';

type ProgressProps = {
    text: number;
  };

const AnimatedExample = (props: ProgressProps) => {
    const { text } = props;
    return <ProgressBar animated variant="success" now={text} label={`${text}%`} />;
}

export default AnimatedExample;