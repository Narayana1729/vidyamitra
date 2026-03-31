import { useEffect, useState } from 'react';

export default function ScoreCircle({ score, size = 120, label = 'Score', color }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;

    const getColor = (s) => {
        if (color) return color;
        if (s >= 80) return 'var(--emerald)';
        if (s >= 60) return 'var(--cyan)';
        if (s >= 40) return 'var(--amber)';
        return 'var(--rose)';
    };

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="score-circle" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    className="score-circle-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                />
                <circle
                    className="score-circle-progress"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor(score)}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ filter: `drop-shadow(0 0 6px ${getColor(score)})` }}
                />
            </svg>
            <div className="score-circle-text">
                <div className="score-circle-value" style={{ color: getColor(score), fontSize: size * 0.22 }}>
                    {animatedScore}
                </div>
                <div className="score-circle-label">{label}</div>
            </div>
        </div>
    );
}
