import React from 'react';

const SparkleOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* يمكنك إضافة أيقونات النجوم هنا لاحقاً */}
      <div className="absolute top-10 right-10 opacity-20 text-yellow-400">✨</div>
      <div className="absolute bottom-20 left-10 opacity-20 text-yellow-400">✨</div>
    </div>
  );
};

export default SparkleOverlay;