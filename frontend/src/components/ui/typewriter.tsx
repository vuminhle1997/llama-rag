'use client';

import React, { useState, useEffect} from 'react';
import { marked } from 'marked';

const TypewriterEffect = ({
  text,
  onLoad: onLoadEnd,
}: {
  text: string;
  onLoad: () => void;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10); // Adjust speed here (lower number = faster)

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length) {
      onLoadEnd();
    }
  }, [currentIndex, text, onLoadEnd]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: marked(displayText + (currentIndex < text.length ? '▋' : '')),
      }}
    ></div>
  );
};

export default TypewriterEffect;
