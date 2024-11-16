import React, { useRef, useEffect } from 'react';

const SimpleWheel = ({ segments, segColors, onSpinStart, wheelEnabled, isMinting}) => {
  const canvasRef = useRef(null);
  const angleRef = useRef(0); // Use a ref for smooth animations
  const animationFrameRef = useRef(null); // To manage the animation frame
  const anglePerSegment = (2 * Math.PI) / segments.length;
  const size = 230; // Rad. wheel

  const drawWheel = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each segment
    for (let i = 0; i < segments.length; i++) {
      const startAngle = anglePerSegment * i + angleRef.current;
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

  const animate = () => {
    angleRef.current += 0.05; // Increment the angle for smooth rotation
    drawWheel();
    animationFrameRef.current = requestAnimationFrame(animate); // Repeat animation
  };

  const startAnimation = () => {
    animationFrameRef.current = requestAnimationFrame(animate); // Start the animation
    if (onSpinStart) {
      onSpinStart(); // Notify parent component that spinning has started
    }
  };

  useEffect(() => {
    if (isMinting) {
      startAnimation(); // Start spinning when minting starts
    } else {
      cancelAnimationFrame(animationFrameRef.current); // Stop the animation
    }
    return () => cancelAnimationFrame(animationFrameRef.current); // Cleanup on unmount
  }, [isMinting]);

  useEffect(() => {
    drawWheel(); // Draw the wheel initially
  }, [segments, segColors]);

  

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
            onClick={startAnimation} 
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
