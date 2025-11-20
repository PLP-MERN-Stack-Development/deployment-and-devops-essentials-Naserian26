const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary-600`}></div>
  );
};

export default LoadingSpinner;