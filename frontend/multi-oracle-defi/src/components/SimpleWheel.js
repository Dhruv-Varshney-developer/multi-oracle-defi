import React, { useRef, useState, useEffect } from 'react';

const SimpleWheel = ({ segments, segColors, onFinished, wheelEnabled, isMinting}) => {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const anglePerSegment = (2 * Math.PI) / segments.length;
  const size = 230; // Rad. wheel

  const drawWheel = (angle = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each segment
    for (let i = 0; i < segments.length; i++) {
      const startAngle = anglePerSegment * i + angle;
      const endAngle = startAngle + anglePerSegment;

      // Draw segment
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, size, startAngle, endAngle);
      ctx.fillStyle = segColors[i % segColors.length];
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
      ctx.restore();

      // Draw segments text
      ctx.save();
      ctx.translate(
        centerX + Math.cos(startAngle + anglePerSegment / 2) * size * 0.7,
        centerY + Math.sin(startAngle + anglePerSegment / 2) * size * 0.7
      );
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(segments[i], 0, 0);
      ctx.restore();
    }

    // Draw knob
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size - 20);
    ctx.lineTo(centerX - 15, centerY - size - 5);
    ctx.lineTo(centerX + 15, centerY - size - 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel();
  }, [segments, segColors]);

  const animate = () => {
    setAngle(prevAngle => prevAngle + 0.1); // Rotate slightly
    drawWheel();
    if (isMinting) {
      requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isMinting) {
      animate(); // Start the animation if minting is in progress
    }
  }, [isMinting]);
  

  return (
    <div style={{ padding:'4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ borderRadius: '50%', border: '3px solid #FFFFFF' }}
      ></canvas>
      {wheelEnabled && (
          <button 
            onClick={animate} 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              backgroundColor: '#42A5F5', 
              color: 'white', 
              fontWeight: 'bold', 
              padding: '10px 20px', 
              borderRadius: '5px', 
              border: 'none', 
              cursor: 'pointer' 
            }}
            >
            Spin
          </button>
      )}
    </div>
  );
};

export default SimpleWheel;
