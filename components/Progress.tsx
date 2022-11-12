import ProgressBar from 'react-bootstrap/ProgressBar';

// function AnimatedExample() {
const AnimatedExample = ({ text }) => {
    return <ProgressBar animated variant="success" now={text} label={`${text}%`} />;
}

export default AnimatedExample;