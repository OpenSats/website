import ProgressBar from 'react-bootstrap/ProgressBar';

function AnimatedExample() {
    const now = 60;
    return <ProgressBar animated variant="success" now={45} label={`${now}%`} />;
}

export default AnimatedExample;